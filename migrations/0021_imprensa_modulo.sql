-- ============================================================
-- 0021_imprensa_modulo.sql
-- Módulo Imprensa: estende tabelas existentes, cria novas
-- tabelas (metas, config, mailings, exportações), views de
-- métricas, triggers updated_at, RLS e seed de config.
-- ============================================================

-- ── 1. Estende spress_veiculos_imprensa ──────────────────────
alter table public.spress_veiculos_imprensa
  add column if not exists regiao        text,
  add column if not exists cidade        text,
  add column if not exists tier          text check (tier in ('tier1','tier2','tier3')),
  add column if not exists periodicidade text,
  add column if not exists principal     boolean not null default false,
  add column if not exists ativo         boolean not null default true,
  add column if not exists observacoes   text,
  add column if not exists updated_at    timestamptz not null default now();

create unique index if not exists uq_spress_veiculos_nome_norm
  on public.spress_veiculos_imprensa (lower(trim(nome)));

create trigger spress_veiculos_updated_at
  before update on public.spress_veiculos_imprensa
  for each row execute function public.spress_set_updated_at();

-- ── 2. Estende spress_jornalistas ────────────────────────────
alter table public.spress_jornalistas
  add column if not exists editoria      text,
  add column if not exists programa      text,
  add column if not exists whatsapp      text,
  add column if not exists regiao        text,
  add column if not exists situacao      text not null default 'ativo'
        check (situacao in ('ativo','desatualizado','revisar','inativo')),
  add column if not exists observacoes   text,
  add column if not exists responsavel_id uuid references public.spress_usuarios(id) on delete set null,
  add column if not exists updated_at    timestamptz not null default now();

create index if not exists idx_spress_jornalistas_situacao
  on public.spress_jornalistas(situacao);

create index if not exists idx_spress_jornalistas_email
  on public.spress_jornalistas(lower(email));

create trigger spress_jornalistas_updated_at
  before update on public.spress_jornalistas
  for each row execute function public.spress_set_updated_at();

-- ── 3. Estende spress_pautas (releases) ──────────────────────
alter table public.spress_pautas
  add column if not exists responsavel_id uuid references public.spress_usuarios(id) on delete set null,
  add column if not exists arquivo_url    text,
  add column if not exists updated_at     timestamptz not null default now();

create trigger spress_pautas_updated_at
  before update on public.spress_pautas
  for each row execute function public.spress_set_updated_at();

-- ── 4. Estende spress_pautas_veiculos (disparos/follow-up) ───
-- Remove NOT NULL de veiculo_id para permitir disparo direto ao jornalista
alter table public.spress_pautas_veiculos
  alter column veiculo_id drop not null;

alter table public.spress_pautas_veiculos
  add column if not exists canal              text check (canal in ('email','whatsapp','telefone','presencial','outro')),
  add column if not exists enviado_em         timestamptz,
  add column if not exists status             text not null default 'enviado'
        check (status in ('enviado','respondido','publicado','recusado','sem_resposta')),
  add column if not exists respondido_em      timestamptz,
  add column if not exists ultimo_followup_em timestamptz,
  add column if not exists qtd_followups      int not null default 0,
  add column if not exists observacoes        text,
  add column if not exists enviado_por        uuid references public.spress_usuarios(id) on delete set null,
  add column if not exists updated_at         timestamptz not null default now();

-- jornalista_id OU veiculo_id deve estar preenchido
alter table public.spress_pautas_veiculos
  drop constraint if exists chk_spress_disparos_destino;

alter table public.spress_pautas_veiculos
  add constraint chk_spress_disparos_destino
    check (jornalista_id is not null or veiculo_id is not null);

create index if not exists idx_spress_disparos_jornalista
  on public.spress_pautas_veiculos(jornalista_id);

create index if not exists idx_spress_disparos_status
  on public.spress_pautas_veiculos(status);

create trigger spress_disparos_updated_at
  before update on public.spress_pautas_veiculos
  for each row execute function public.spress_set_updated_at();

-- RLS: remover leitura do cliente de spress_pautas_veiculos (dados pessoais de jornalistas)
drop policy if exists spress_pautas_veiculos_select on public.spress_pautas_veiculos;

create policy spress_pautas_veiculos_select on public.spress_pautas_veiculos
  for select using (public.spress_is_staff());

-- ── 5. Estende spress_clipping ───────────────────────────────
alter table public.spress_clipping
  add column if not exists disparo_id      uuid references public.spress_pautas_veiculos(id) on delete set null,
  add column if not exists formato         text check (formato in ('materia','nota','artigo','entrevista','impresso','reels','shorts','video','post','podcast','outro')),
  add column if not exists registrado_por  uuid references public.spress_usuarios(id) on delete set null,
  add column if not exists updated_at      timestamptz not null default now();

create index if not exists idx_spress_clipping_data
  on public.spress_clipping(data_publicacao);

create trigger spress_clipping_updated_at
  before update on public.spress_clipping
  for each row execute function public.spress_set_updated_at();

-- ── 6. Metas mensais ─────────────────────────────────────────
create table if not exists public.spress_imprensa_metas (
  id          uuid        primary key default gen_random_uuid(),
  cliente_id  uuid        not null references public.spress_clientes(id) on delete cascade,
  mes         date        not null check (extract(day from mes) = 1),
  meta        int         not null check (meta >= 0),
  observacoes text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (cliente_id, mes)
);

alter table public.spress_imprensa_metas enable row level security;

create policy spress_imprensa_metas_select on public.spress_imprensa_metas
  for select using (public.spress_is_staff());

create policy spress_imprensa_metas_write on public.spress_imprensa_metas
  for all using (public.spress_is_staff()) with check (public.spress_is_staff());

create trigger spress_imprensa_metas_updated_at
  before update on public.spress_imprensa_metas
  for each row execute function public.spress_set_updated_at();

-- ── 7. Configurações (alertas, ranking, mailing) ─────────────
create table if not exists public.spress_imprensa_config (
  chave      text        primary key,
  valor      jsonb       not null,
  updated_at timestamptz not null default now()
);

alter table public.spress_imprensa_config enable row level security;

create policy spress_imprensa_config_select on public.spress_imprensa_config
  for select using (public.spress_is_staff());

create policy spress_imprensa_config_write on public.spress_imprensa_config
  for all using (public.spress_is_staff()) with check (public.spress_is_staff());

create trigger spress_imprensa_config_updated_at
  before update on public.spress_imprensa_config
  for each row execute function public.spress_set_updated_at();

-- Seed de configuração padrão
insert into public.spress_imprensa_config (chave, valor) values
  ('alerta_jornalista', '{"envios_seguidos_sem_resposta":3,"taxa_publicacao_min":0.10,"janela_dias":90,"dias_para_sem_resposta":7}'::jsonb),
  ('alerta_cliente',    '{"dia_inicio_alerta":15}'::jsonb),
  ('ranking',           '{"peso_publicacao":0.6,"peso_resposta":0.3,"peso_rapidez":0.1,"min_envios":3,"janela_dias":180}'::jsonb),
  ('mailing',           '{"mailing_max_registros":2000}'::jsonb)
on conflict (chave) do nothing;

-- ── 8. Mailings salvos ───────────────────────────────────────
create table if not exists public.spress_imprensa_mailings (
  id          uuid    primary key default gen_random_uuid(),
  nome        text    not null,
  descricao   text,
  cliente_id  uuid    references public.spress_clientes(id) on delete set null,
  filtros     jsonb   not null default '{}'::jsonb,
  campos      text[]  not null,
  opcoes      jsonb   not null default '{}'::jsonb,
  incluidos   uuid[]  not null default '{}',
  excluidos   uuid[]  not null default '{}',
  criado_por  uuid    references public.spress_usuarios(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.spress_imprensa_mailings enable row level security;

create policy spress_imprensa_mailings_select on public.spress_imprensa_mailings
  for select using (public.spress_is_staff());

create policy spress_imprensa_mailings_write on public.spress_imprensa_mailings
  for all using (public.spress_is_staff()) with check (public.spress_is_staff());

create trigger spress_imprensa_mailings_updated_at
  before update on public.spress_imprensa_mailings
  for each row execute function public.spress_set_updated_at();

-- ── 9. Log de exportações (LGPD) ─────────────────────────────
create table if not exists public.spress_imprensa_mailing_exportacoes (
  id             uuid    primary key default gen_random_uuid(),
  mailing_id     uuid    references public.spress_imprensa_mailings(id) on delete set null,
  filtros        jsonb   not null,
  campos         text[]  not null,
  formato        text    not null check (formato in ('csv','xlsx','emails_txt','vcf')),
  qtd_registros  int     not null,
  exportado_por  uuid    references public.spress_usuarios(id) on delete set null,
  created_at     timestamptz not null default now()
);

alter table public.spress_imprensa_mailing_exportacoes enable row level security;

create policy spress_imprensa_exportacoes_select on public.spress_imprensa_mailing_exportacoes
  for select using (public.spress_is_staff());

create policy spress_imprensa_exportacoes_write on public.spress_imprensa_mailing_exportacoes
  for all using (public.spress_is_staff()) with check (public.spress_is_staff());

-- ── 10. Views de métricas ─────────────────────────────────────

-- 10.1 Métricas por jornalista
create or replace view public.spress_v_jornalista_metricas
  with (security_invoker = true)
as
with cfg as (
  select
    (valor->>'janela_dias')::int        as janela_dias,
    (valor->>'dias_para_sem_resposta')::int as dias_vencer
  from public.spress_imprensa_config where chave = 'alerta_jornalista'
),
janela as (
  select now() - (janela_dias || ' days')::interval as desde from cfg
),
disparos as (
  select
    pv.jornalista_id,
    count(*)                                                                      as envios,
    count(*) filter (where pv.status = 'respondido')                              as respondidos,
    count(*) filter (where pv.status = 'publicado')                               as publicados,
    max(pv.enviado_em)                                                            as ultimo_envio,
    max(case when pv.status = 'publicado' then pv.updated_at end)                 as ultima_publicacao,
    avg(case when pv.respondido_em is not null and pv.enviado_em is not null
          then extract(epoch from (pv.respondido_em - pv.enviado_em))/3600
        end)                                                                       as tempo_medio_resposta_horas
  from public.spress_pautas_veiculos pv
  cross join janela j
  where pv.jornalista_id is not null
    and (pv.enviado_em is null or pv.enviado_em >= j.desde)
  group by pv.jornalista_id
),
-- Conta disparos consecutivos mais recentes sem resposta (enviado vencido ou sem_resposta)
consec as (
  select
    pv.jornalista_id,
    count(*) as envios_seguidos_sem_resposta
  from (
    select
      pv2.jornalista_id,
      pv2.status,
      pv2.enviado_em,
      row_number() over (partition by pv2.jornalista_id order by coalesce(pv2.enviado_em, pv2.created_at) desc) as rn,
      -- Detecta primeira ruptura (status respondido/publicado/recusado)
      max(case when pv2.status in ('respondido','publicado','recusado') then 1 else 0 end)
        over (partition by pv2.jornalista_id
              order by coalesce(pv2.enviado_em, pv2.created_at) desc
              rows between unbounded preceding and current row) as teve_resposta
    from public.spress_pautas_veiculos pv2
    where pv2.jornalista_id is not null
  ) pv
  where pv.teve_resposta = 0
    and pv.status in ('enviado','sem_resposta')
  group by pv.jornalista_id
)
select
  j.id                                                              as jornalista_id,
  j.nome,
  j.situacao,
  coalesce(d.envios, 0)                                            as envios,
  coalesce(d.respondidos, 0)                                       as respondidos,
  coalesce(d.publicados, 0)                                        as publicados,
  case when coalesce(d.envios,0) = 0 then 0
       else round(d.respondidos::numeric / d.envios, 4) end        as taxa_resposta,
  case when coalesce(d.envios,0) = 0 then 0
       else round(d.publicados::numeric  / d.envios, 4) end        as taxa_publicacao,
  d.tempo_medio_resposta_horas,
  d.ultimo_envio,
  d.ultima_publicacao,
  coalesce(c.envios_seguidos_sem_resposta, 0)                      as envios_seguidos_sem_resposta
from public.spress_jornalistas j
left join disparos d on d.jornalista_id = j.id
left join consec   c on c.jornalista_id = j.id;

-- 10.2 Métricas por veículo
create or replace view public.spress_v_veiculo_metricas
  with (security_invoker = true)
as
with cfg as (
  select (valor->>'janela_dias')::int as janela_dias
  from public.spress_imprensa_config where chave = 'alerta_jornalista'
),
janela as (
  select now() - (janela_dias || ' days')::interval as desde from cfg
),
disparos as (
  select
    coalesce(pv.veiculo_id, j.veiculo_id)                                         as veiculo_id,
    count(*)                                                                       as envios,
    count(*) filter (where pv.status = 'respondido')                               as respondidos,
    count(*) filter (where pv.status = 'publicado')                                as publicados,
    max(pv.enviado_em)                                                             as ultimo_envio,
    max(case when pv.status = 'publicado' then pv.updated_at end)                  as ultima_publicacao
  from public.spress_pautas_veiculos pv
  left join public.spress_jornalistas j on j.id = pv.jornalista_id
  cross join janela jn
  where (pv.enviado_em is null or pv.enviado_em >= jn.desde)
    and coalesce(pv.veiculo_id, j.veiculo_id) is not null
  group by coalesce(pv.veiculo_id, j.veiculo_id)
)
select
  v.id                                                              as veiculo_id,
  v.nome,
  v.tipo,
  v.regiao,
  coalesce(d.envios, 0)                                            as envios,
  coalesce(d.respondidos, 0)                                       as respondidos,
  coalesce(d.publicados, 0)                                        as publicados,
  case when coalesce(d.envios,0) = 0 then 0
       else round(d.respondidos::numeric / d.envios, 4) end        as taxa_resposta,
  case when coalesce(d.envios,0) = 0 then 0
       else round(d.publicados::numeric  / d.envios, 4) end        as taxa_publicacao,
  d.ultimo_envio,
  d.ultima_publicacao
from public.spress_veiculos_imprensa v
left join disparos d on d.veiculo_id = v.id;

-- 10.3 Meta × realizado por cliente e mês
create or replace view public.spress_v_cliente_meta_mes
  with (security_invoker = true)
as
select
  m.id,
  m.cliente_id,
  c.nome_fantasia  as cliente_nome,
  m.mes,
  m.meta,
  count(cl.id)                                                      as realizado,
  case when m.meta = 0 then null
       else round(count(cl.id)::numeric / m.meta * 100, 1) end     as percentual,
  -- Ritmo esperado = meta × (dia_atual / dias_do_mês)
  case when m.meta = 0 then null
       when date_trunc('month', now())::date = m.mes
       then round(
         m.meta::numeric
         * extract(day from now())
         / extract(day from (m.mes + interval '1 month - 1 day')), 2
       )
       else null
  end                                                                as ritmo_esperado
from public.spress_imprensa_metas m
join public.spress_clientes c on c.id = m.cliente_id
left join public.spress_clipping cl
  on cl.cliente_id = m.cliente_id
  and date_trunc('month', cl.data_publicacao) = m.mes
group by m.id, m.cliente_id, c.nome_fantasia, m.mes, m.meta;
