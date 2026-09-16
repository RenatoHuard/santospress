-- Santos Press — schema inicial
-- Convenção: TEXT + CHECK no lugar de ENUM (mais fácil de evoluir com ALTER TABLE futuramente).
-- Todas as tabelas novas usam prefixo spress_. user_system é compartilhada com o TalkLocal.

begin;

-- ============================================================
-- 1. ISOLAMENTO ENTRE SISTEMAS
-- ============================================================

create table if not exists public.user_system (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  sistema     text not null check (sistema in ('talklocal','spress')),
  created_at  timestamptz not null default now()
);

alter table public.user_system enable row level security;

create policy user_system_select_own on public.user_system
  for select using (user_id = auth.uid());

-- Sem policy de insert/update/delete: vínculo é gerenciado via service role (backend/admin).

-- ============================================================
-- 2. SETORES E USUÁRIOS INTERNOS
-- ============================================================

create table public.spress_setores (
  id                 uuid primary key default gen_random_uuid(),
  nome               text not null unique,
  descricao          text,
  acesso_financeiro  boolean not null default false,
  created_at         timestamptz not null default now()
);

create table public.spress_usuarios (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid not null unique references auth.users(id) on delete cascade,
  nome          text not null,
  email         text,
  cargo         text,
  setor_id      uuid references public.spress_setores(id),
  role          text not null default 'colaborador' check (role in ('admin','atendente','colaborador','cliente')),
  ativo         boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_spress_usuarios_setor on public.spress_usuarios(setor_id);

-- ============================================================
-- 3. FUNÇÕES HELPER (SECURITY DEFINER para evitar recursão de RLS)
-- ============================================================

create or replace function public.spress_is_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_system
    where user_id = auth.uid() and sistema = 'spress'
  );
$$;

create or replace function public.spress_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.spress_usuarios where auth_user_id = auth.uid();
$$;

create or replace function public.spress_usuario_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.spress_usuarios where auth_user_id = auth.uid();
$$;

create or replace function public.spress_setor_id()
returns uuid language sql stable security definer set search_path = public as $$
  select setor_id from public.spress_usuarios where auth_user_id = auth.uid();
$$;

create or replace function public.spress_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.spress_role() = 'admin';
$$;

create or replace function public.spress_is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.spress_role() in ('admin','atendente','colaborador');
$$;

create or replace function public.spress_is_financeiro()
returns boolean language sql stable security definer set search_path = public as $$
  select public.spress_is_admin() or exists (
    select 1 from public.spress_setores s
    where s.id = public.spress_setor_id() and s.acesso_financeiro = true
  );
$$;

create or replace function public.spress_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 4. SETORES / USUÁRIOS — RLS
-- ============================================================

alter table public.spress_setores enable row level security;
alter table public.spress_usuarios enable row level security;

create policy spress_setores_select on public.spress_setores
  for select using (public.spress_is_member());
create policy spress_setores_write on public.spress_setores
  for all using (public.spress_is_admin()) with check (public.spress_is_admin());

create policy spress_usuarios_select on public.spress_usuarios
  for select using (public.spress_is_member());
create policy spress_usuarios_write on public.spress_usuarios
  for all using (public.spress_is_admin()) with check (public.spress_is_admin());

create trigger trg_spress_usuarios_updated_at
  before update on public.spress_usuarios
  for each row execute function public.spress_set_updated_at();

-- ============================================================
-- 5. CADASTRO: CLIENTES / CONTATOS / CONTRATOS
-- ============================================================

create table public.spress_clientes (
  id             uuid primary key default gen_random_uuid(),
  razao_social   text not null,
  nome_fantasia  text,
  cnpj           text,
  atendente_id   uuid references public.spress_usuarios(id),
  status         text not null default 'ativo' check (status in ('ativo','pausado','encerrado')),
  observacoes    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_spress_clientes_atendente on public.spress_clientes(atendente_id);

create table public.spress_clientes_contatos (
  id            uuid primary key default gen_random_uuid(),
  cliente_id    uuid not null references public.spress_clientes(id) on delete cascade,
  auth_user_id  uuid references auth.users(id) on delete set null,
  nome          text not null,
  email         text,
  telefone      text,
  cargo         text,
  principal     boolean not null default false,
  created_at    timestamptz not null default now()
);

create index idx_spress_clientes_contatos_cliente on public.spress_clientes_contatos(cliente_id);
create index idx_spress_clientes_contatos_auth on public.spress_clientes_contatos(auth_user_id);

-- Depende de spress_clientes_contatos, por isso definida aqui e não na seção 3.
create or replace function public.spress_cliente_ids()
returns uuid[] language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(cliente_id), '{}') from public.spress_clientes_contatos where auth_user_id = auth.uid();
$$;

create table public.spress_contratos (
  id             uuid primary key default gen_random_uuid(),
  cliente_id     uuid not null references public.spress_clientes(id) on delete cascade,
  servicos       text[] not null default '{}',
  valor_mensal   numeric(12,2),
  data_inicio    date not null,
  data_fim       date,
  status         text not null default 'ativo' check (status in ('ativo','suspenso','encerrado')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_spress_contratos_cliente on public.spress_contratos(cliente_id);

alter table public.spress_clientes enable row level security;
alter table public.spress_clientes_contatos enable row level security;
alter table public.spress_contratos enable row level security;

create policy spress_clientes_select on public.spress_clientes
  for select using (public.spress_is_staff() or id = any(public.spress_cliente_ids()));
create policy spress_clientes_write on public.spress_clientes
  for all using (public.spress_is_admin() or public.spress_role() = 'atendente')
  with check (public.spress_is_admin() or public.spress_role() = 'atendente');

create policy spress_clientes_contatos_select on public.spress_clientes_contatos
  for select using (public.spress_is_staff() or cliente_id = any(public.spress_cliente_ids()));
create policy spress_clientes_contatos_write on public.spress_clientes_contatos
  for all using (public.spress_is_admin() or public.spress_role() = 'atendente')
  with check (public.spress_is_admin() or public.spress_role() = 'atendente');

create policy spress_contratos_select on public.spress_contratos
  for select using (public.spress_is_staff() or cliente_id = any(public.spress_cliente_ids()));
create policy spress_contratos_write on public.spress_contratos
  for all using (public.spress_is_admin() or public.spress_role() = 'atendente')
  with check (public.spress_is_admin() or public.spress_role() = 'atendente');

create trigger trg_spress_clientes_updated_at
  before update on public.spress_clientes
  for each row execute function public.spress_set_updated_at();
create trigger trg_spress_contratos_updated_at
  before update on public.spress_contratos
  for each row execute function public.spress_set_updated_at();

-- ============================================================
-- 6. KANBAN: QUADROS / COLUNAS / DEMANDAS
-- ============================================================

create table public.spress_quadros (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  cliente_id  uuid references public.spress_clientes(id) on delete cascade,
  setor_id    uuid references public.spress_setores(id),
  created_at  timestamptz not null default now()
);

create table public.spress_colunas (
  id         uuid primary key default gen_random_uuid(),
  quadro_id  uuid not null references public.spress_quadros(id) on delete cascade,
  nome       text not null,
  ordem      int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_spress_colunas_quadro on public.spress_colunas(quadro_id);

create table public.spress_demandas (
  id              uuid primary key default gen_random_uuid(),
  quadro_id       uuid not null references public.spress_quadros(id) on delete cascade,
  coluna_id       uuid not null references public.spress_colunas(id),
  titulo          text not null,
  descricao       text,
  cliente_id      uuid references public.spress_clientes(id) on delete cascade,
  setor_id        uuid references public.spress_setores(id),
  atendente_id    uuid references public.spress_usuarios(id),
  responsavel_id  uuid references public.spress_usuarios(id),
  criado_por      uuid references auth.users(id),
  origem          text not null default 'atendente' check (origem in ('cliente','atendente')),
  prioridade      text not null default 'media' check (prioridade in ('baixa','media','alta','urgente')),
  tipo            text check (tipo in ('imprensa','conteudo','blog','outro')),
  prazo           date,
  concluida_em    timestamptz,
  ordem           int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_spress_demandas_quadro on public.spress_demandas(quadro_id);
create index idx_spress_demandas_coluna on public.spress_demandas(coluna_id);
create index idx_spress_demandas_cliente on public.spress_demandas(cliente_id);
create index idx_spress_demandas_setor on public.spress_demandas(setor_id);
create index idx_spress_demandas_responsavel on public.spress_demandas(responsavel_id);

create table public.spress_demanda_checklist (
  id          uuid primary key default gen_random_uuid(),
  demanda_id  uuid not null references public.spress_demandas(id) on delete cascade,
  descricao   text not null,
  concluido   boolean not null default false,
  ordem       int not null default 0,
  created_at  timestamptz not null default now()
);

create table public.spress_demanda_comentarios (
  id          uuid primary key default gen_random_uuid(),
  demanda_id  uuid not null references public.spress_demandas(id) on delete cascade,
  autor_id    uuid not null references auth.users(id),
  texto       text not null,
  created_at  timestamptz not null default now()
);

create table public.spress_demanda_anexos (
  id             uuid primary key default gen_random_uuid(),
  demanda_id     uuid not null references public.spress_demandas(id) on delete cascade,
  nome_arquivo   text not null,
  url            text not null,
  tamanho_bytes  bigint,
  enviado_por    uuid references auth.users(id),
  created_at     timestamptz not null default now()
);

create table public.spress_demanda_historico (
  id                 uuid primary key default gen_random_uuid(),
  demanda_id         uuid not null references public.spress_demandas(id) on delete cascade,
  coluna_anterior_id uuid references public.spress_colunas(id),
  coluna_nova_id     uuid references public.spress_colunas(id),
  alterado_por       uuid references auth.users(id),
  created_at         timestamptz not null default now()
);

create index idx_spress_demanda_checklist_demanda on public.spress_demanda_checklist(demanda_id);
create index idx_spress_demanda_comentarios_demanda on public.spress_demanda_comentarios(demanda_id);
create index idx_spress_demanda_anexos_demanda on public.spress_demanda_anexos(demanda_id);
create index idx_spress_demanda_historico_demanda on public.spress_demanda_historico(demanda_id);

create table public.spress_labels (
  id    uuid primary key default gen_random_uuid(),
  nome  text not null,
  cor   text not null default '#999999'
);

create table public.spress_demanda_labels (
  demanda_id  uuid not null references public.spress_demandas(id) on delete cascade,
  label_id    uuid not null references public.spress_labels(id) on delete cascade,
  primary key (demanda_id, label_id)
);

alter table public.spress_quadros enable row level security;
alter table public.spress_colunas enable row level security;
alter table public.spress_demandas enable row level security;
alter table public.spress_demanda_checklist enable row level security;
alter table public.spress_demanda_comentarios enable row level security;
alter table public.spress_demanda_anexos enable row level security;
alter table public.spress_demanda_historico enable row level security;
alter table public.spress_labels enable row level security;
alter table public.spress_demanda_labels enable row level security;

create policy spress_quadros_select on public.spress_quadros
  for select using (public.spress_is_staff() or (cliente_id is not null and cliente_id = any(public.spress_cliente_ids())));
create policy spress_quadros_write on public.spress_quadros
  for all using (public.spress_is_admin() or public.spress_role() = 'atendente')
  with check (public.spress_is_admin() or public.spress_role() = 'atendente');

create policy spress_colunas_select on public.spress_colunas
  for select using (
    exists (select 1 from public.spress_quadros q where q.id = quadro_id and
      (public.spress_is_staff() or (q.cliente_id is not null and q.cliente_id = any(public.spress_cliente_ids()))))
  );
create policy spress_colunas_write on public.spress_colunas
  for all using (public.spress_is_admin() or public.spress_role() = 'atendente')
  with check (public.spress_is_admin() or public.spress_role() = 'atendente');

create policy spress_demandas_select on public.spress_demandas
  for select using (public.spress_is_staff() or cliente_id = any(public.spress_cliente_ids()));
create policy spress_demandas_insert on public.spress_demandas
  for insert with check (
    public.spress_is_staff() or
    (cliente_id = any(public.spress_cliente_ids()) and origem = 'cliente')
  );
create policy spress_demandas_update on public.spress_demandas
  for update using (
    public.spress_is_admin() or
    public.spress_role() = 'atendente' or
    (public.spress_role() = 'colaborador' and (responsavel_id = public.spress_usuario_id() or setor_id = public.spress_setor_id())) or
    cliente_id = any(public.spress_cliente_ids())
  );
create policy spress_demandas_delete on public.spress_demandas
  for delete using (public.spress_is_admin() or public.spress_role() = 'atendente');

create policy spress_demanda_checklist_all on public.spress_demanda_checklist
  for all using (
    exists (select 1 from public.spress_demandas d where d.id = demanda_id and
      (public.spress_is_staff() or d.cliente_id = any(public.spress_cliente_ids())))
  ) with check (
    exists (select 1 from public.spress_demandas d where d.id = demanda_id and
      (public.spress_is_staff() or d.cliente_id = any(public.spress_cliente_ids())))
  );

create policy spress_demanda_comentarios_all on public.spress_demanda_comentarios
  for all using (
    exists (select 1 from public.spress_demandas d where d.id = demanda_id and
      (public.spress_is_staff() or d.cliente_id = any(public.spress_cliente_ids())))
  ) with check (
    exists (select 1 from public.spress_demandas d where d.id = demanda_id and
      (public.spress_is_staff() or d.cliente_id = any(public.spress_cliente_ids())))
  );

create policy spress_demanda_anexos_all on public.spress_demanda_anexos
  for all using (
    exists (select 1 from public.spress_demandas d where d.id = demanda_id and
      (public.spress_is_staff() or d.cliente_id = any(public.spress_cliente_ids())))
  ) with check (
    exists (select 1 from public.spress_demandas d where d.id = demanda_id and
      (public.spress_is_staff() or d.cliente_id = any(public.spress_cliente_ids())))
  );

create policy spress_demanda_historico_select on public.spress_demanda_historico
  for select using (
    exists (select 1 from public.spress_demandas d where d.id = demanda_id and
      (public.spress_is_staff() or d.cliente_id = any(public.spress_cliente_ids())))
  );
create policy spress_demanda_historico_insert on public.spress_demanda_historico
  for insert with check (public.spress_is_staff());

create policy spress_labels_select on public.spress_labels for select using (public.spress_is_member());
create policy spress_labels_write on public.spress_labels
  for all using (public.spress_is_admin() or public.spress_role() = 'atendente')
  with check (public.spress_is_admin() or public.spress_role() = 'atendente');

create policy spress_demanda_labels_select on public.spress_demanda_labels
  for select using (
    exists (select 1 from public.spress_demandas d where d.id = demanda_id and
      (public.spress_is_staff() or d.cliente_id = any(public.spress_cliente_ids())))
  );
create policy spress_demanda_labels_write on public.spress_demanda_labels
  for all using (public.spress_is_staff()) with check (public.spress_is_staff());

create trigger trg_spress_demandas_updated_at
  before update on public.spress_demandas
  for each row execute function public.spress_set_updated_at();

create or replace function public.spress_log_demanda_coluna_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.coluna_id is distinct from old.coluna_id then
    insert into public.spress_demanda_historico (demanda_id, coluna_anterior_id, coluna_nova_id, alterado_por)
    values (new.id, old.coluna_id, new.coluna_id, auth.uid());
  end if;
  return new;
end;
$$;

create trigger trg_spress_demandas_log_coluna
  after update on public.spress_demandas
  for each row execute function public.spress_log_demanda_coluna_change();

-- ============================================================
-- 7. ASSESSORIA DE IMPRENSA
-- ============================================================

create table public.spress_veiculos_imprensa (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  tipo          text check (tipo in ('jornal','revista','tv','radio','portal','blog','podcast','outro')),
  abrangencia   text check (abrangencia in ('local','regional','nacional','internacional')),
  site          text,
  created_at    timestamptz not null default now()
);

create table public.spress_jornalistas (
  id               uuid primary key default gen_random_uuid(),
  nome             text not null,
  veiculo_id       uuid references public.spress_veiculos_imprensa(id),
  email            text,
  telefone         text,
  cargo            text,
  pauta_interesse  text,
  created_at       timestamptz not null default now()
);

create index idx_spress_jornalistas_veiculo on public.spress_jornalistas(veiculo_id);

create table public.spress_pautas (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references public.spress_clientes(id) on delete cascade,
  demanda_id  uuid references public.spress_demandas(id) on delete set null,
  titulo      text not null,
  resumo      text,
  data_envio  date,
  status      text not null default 'rascunho' check (status in ('rascunho','enviada','publicada','recusada')),
  criado_por  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

create index idx_spress_pautas_cliente on public.spress_pautas(cliente_id);

create table public.spress_pautas_veiculos (
  id            uuid primary key default gen_random_uuid(),
  pauta_id      uuid not null references public.spress_pautas(id) on delete cascade,
  veiculo_id    uuid not null references public.spress_veiculos_imprensa(id) on delete cascade,
  jornalista_id uuid references public.spress_jornalistas(id),
  created_at    timestamptz not null default now()
);

create index idx_spress_pautas_veiculos_pauta on public.spress_pautas_veiculos(pauta_id);

create table public.spress_clipping (
  id                 uuid primary key default gen_random_uuid(),
  cliente_id         uuid not null references public.spress_clientes(id) on delete cascade,
  pauta_id           uuid references public.spress_pautas(id) on delete set null,
  veiculo_id         uuid references public.spress_veiculos_imprensa(id),
  jornalista_id      uuid references public.spress_jornalistas(id),
  titulo             text,
  url                text,
  data_publicacao    date,
  alcance_estimado   bigint,
  valor_midia        numeric(12,2),
  sentimento         text check (sentimento in ('positivo','neutro','negativo')),
  created_at         timestamptz not null default now()
);

create index idx_spress_clipping_cliente on public.spress_clipping(cliente_id);

alter table public.spress_veiculos_imprensa enable row level security;
alter table public.spress_jornalistas enable row level security;
alter table public.spress_pautas enable row level security;
alter table public.spress_pautas_veiculos enable row level security;
alter table public.spress_clipping enable row level security;

create policy spress_veiculos_select on public.spress_veiculos_imprensa for select using (public.spress_is_staff());
create policy spress_veiculos_write on public.spress_veiculos_imprensa
  for all using (public.spress_is_staff()) with check (public.spress_is_staff());

create policy spress_jornalistas_select on public.spress_jornalistas for select using (public.spress_is_staff());
create policy spress_jornalistas_write on public.spress_jornalistas
  for all using (public.spress_is_staff()) with check (public.spress_is_staff());

create policy spress_pautas_select on public.spress_pautas
  for select using (public.spress_is_staff() or cliente_id = any(public.spress_cliente_ids()));
create policy spress_pautas_write on public.spress_pautas
  for all using (public.spress_is_staff()) with check (public.spress_is_staff());

create policy spress_pautas_veiculos_select on public.spress_pautas_veiculos
  for select using (
    exists (select 1 from public.spress_pautas p where p.id = pauta_id and
      (public.spress_is_staff() or p.cliente_id = any(public.spress_cliente_ids())))
  );
create policy spress_pautas_veiculos_write on public.spress_pautas_veiculos
  for all using (public.spress_is_staff()) with check (public.spress_is_staff());

create policy spress_clipping_select on public.spress_clipping
  for select using (public.spress_is_staff() or cliente_id = any(public.spress_cliente_ids()));
create policy spress_clipping_write on public.spress_clipping
  for all using (public.spress_is_staff()) with check (public.spress_is_staff());

-- ============================================================
-- 8. CONTEÚDO / REDES SOCIAIS
-- ============================================================

create table public.spress_redes_sociais_contas (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references public.spress_clientes(id) on delete cascade,
  plataforma  text not null check (plataforma in ('instagram','facebook','tiktok','linkedin','youtube','x','pinterest','outro')),
  handle      text,
  url         text,
  created_at  timestamptz not null default now()
);

create index idx_spress_redes_contas_cliente on public.spress_redes_sociais_contas(cliente_id);

create table public.spress_publicacoes (
  id             uuid primary key default gen_random_uuid(),
  cliente_id     uuid not null references public.spress_clientes(id) on delete cascade,
  conta_id       uuid references public.spress_redes_sociais_contas(id) on delete set null,
  demanda_id     uuid references public.spress_demandas(id) on delete set null,
  titulo         text,
  legenda        text,
  tipo_conteudo  text check (tipo_conteudo in ('feed','story','reels','carrossel','video','outro')),
  status         text not null default 'rascunho' check (status in ('rascunho','aguardando_aprovacao','aprovado','agendado','publicado','rejeitado')),
  data_agendada  timestamptz,
  publicado_em   timestamptz,
  criado_por     uuid references auth.users(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_spress_publicacoes_cliente on public.spress_publicacoes(cliente_id);
create index idx_spress_publicacoes_status on public.spress_publicacoes(status);

create table public.spress_publicacoes_midias (
  id             uuid primary key default gen_random_uuid(),
  publicacao_id  uuid not null references public.spress_publicacoes(id) on delete cascade,
  url            text not null,
  tipo           text check (tipo in ('imagem','video')),
  ordem          int not null default 0,
  created_at     timestamptz not null default now()
);

create index idx_spress_publicacoes_midias_publicacao on public.spress_publicacoes_midias(publicacao_id);

alter table public.spress_redes_sociais_contas enable row level security;
alter table public.spress_publicacoes enable row level security;
alter table public.spress_publicacoes_midias enable row level security;

create policy spress_redes_contas_select on public.spress_redes_sociais_contas
  for select using (public.spress_is_staff() or cliente_id = any(public.spress_cliente_ids()));
create policy spress_redes_contas_write on public.spress_redes_sociais_contas
  for all using (public.spress_is_staff()) with check (public.spress_is_staff());

create policy spress_publicacoes_select on public.spress_publicacoes
  for select using (public.spress_is_staff() or cliente_id = any(public.spress_cliente_ids()));
create policy spress_publicacoes_insert on public.spress_publicacoes
  for insert with check (public.spress_is_staff());
create policy spress_publicacoes_update on public.spress_publicacoes
  for update using (public.spress_is_staff() or cliente_id = any(public.spress_cliente_ids()));
create policy spress_publicacoes_delete on public.spress_publicacoes
  for delete using (public.spress_is_staff());

create policy spress_publicacoes_midias_select on public.spress_publicacoes_midias
  for select using (
    exists (select 1 from public.spress_publicacoes p where p.id = publicacao_id and
      (public.spress_is_staff() or p.cliente_id = any(public.spress_cliente_ids())))
  );
create policy spress_publicacoes_midias_write on public.spress_publicacoes_midias
  for all using (public.spress_is_staff()) with check (public.spress_is_staff());

create trigger trg_spress_publicacoes_updated_at
  before update on public.spress_publicacoes
  for each row execute function public.spress_set_updated_at();

-- ============================================================
-- 9. BLOG / SITE INSTITUCIONAL (Santos Press — não vinculado a cliente)
-- ============================================================

create table public.spress_blog_posts (
  id            uuid primary key default gen_random_uuid(),
  titulo        text not null,
  slug          text not null unique,
  resumo        text,
  conteudo      text,
  capa_url      text,
  status        text not null default 'rascunho' check (status in ('rascunho','publicado','arquivado')),
  autor_id      uuid references public.spress_usuarios(id),
  publicado_em  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.spress_paginas_site (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  titulo           text not null,
  conteudo         jsonb not null default '{}'::jsonb,
  status           text not null default 'publicado' check (status in ('rascunho','publicado')),
  atualizado_por   uuid references public.spress_usuarios(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.spress_blog_posts enable row level security;
alter table public.spress_paginas_site enable row level security;

-- Conteúdo institucional publicado é público (site da Santos Press o consome sem login).
create policy spress_blog_posts_public_select on public.spress_blog_posts
  for select using (status = 'publicado' or public.spress_is_staff());
create policy spress_blog_posts_write on public.spress_blog_posts
  for all using (public.spress_is_admin() or public.spress_role() = 'atendente')
  with check (public.spress_is_admin() or public.spress_role() = 'atendente');

create policy spress_paginas_site_public_select on public.spress_paginas_site
  for select using (status = 'publicado' or public.spress_is_staff());
create policy spress_paginas_site_write on public.spress_paginas_site
  for all using (public.spress_is_admin() or public.spress_role() = 'atendente')
  with check (public.spress_is_admin() or public.spress_role() = 'atendente');

create trigger trg_spress_blog_posts_updated_at
  before update on public.spress_blog_posts
  for each row execute function public.spress_set_updated_at();
create trigger trg_spress_paginas_site_updated_at
  before update on public.spress_paginas_site
  for each row execute function public.spress_set_updated_at();

-- ============================================================
-- 10. FINANCEIRO (controle interno — admin + setor com acesso_financeiro)
-- ============================================================

create table public.spress_categorias_financeiras (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  tipo        text not null check (tipo in ('receita','despesa')),
  created_at  timestamptz not null default now()
);

create table public.spress_contas_receber (
  id            uuid primary key default gen_random_uuid(),
  cliente_id    uuid references public.spress_clientes(id) on delete set null,
  contrato_id   uuid references public.spress_contratos(id) on delete set null,
  categoria_id  uuid references public.spress_categorias_financeiras(id),
  descricao     text not null,
  valor         numeric(12,2) not null,
  vencimento    date not null,
  pago_em       date,
  status        text not null default 'pendente' check (status in ('pendente','pago','atrasado','cancelado')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.spress_contas_pagar (
  id            uuid primary key default gen_random_uuid(),
  fornecedor    text not null,
  categoria_id  uuid references public.spress_categorias_financeiras(id),
  descricao     text not null,
  valor         numeric(12,2) not null,
  vencimento    date not null,
  pago_em       date,
  status        text not null default 'pendente' check (status in ('pendente','pago','atrasado','cancelado')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_spress_contas_receber_cliente on public.spress_contas_receber(cliente_id);
create index idx_spress_contas_receber_status on public.spress_contas_receber(status);
create index idx_spress_contas_pagar_status on public.spress_contas_pagar(status);

alter table public.spress_categorias_financeiras enable row level security;
alter table public.spress_contas_receber enable row level security;
alter table public.spress_contas_pagar enable row level security;

create policy spress_categorias_financeiras_all on public.spress_categorias_financeiras
  for all using (public.spress_is_financeiro()) with check (public.spress_is_financeiro());
create policy spress_contas_receber_all on public.spress_contas_receber
  for all using (public.spress_is_financeiro()) with check (public.spress_is_financeiro());
create policy spress_contas_pagar_all on public.spress_contas_pagar
  for all using (public.spress_is_financeiro()) with check (public.spress_is_financeiro());

create trigger trg_spress_contas_receber_updated_at
  before update on public.spress_contas_receber
  for each row execute function public.spress_set_updated_at();
create trigger trg_spress_contas_pagar_updated_at
  before update on public.spress_contas_pagar
  for each row execute function public.spress_set_updated_at();

-- ============================================================
-- 11. NOTIFICAÇÕES
-- ============================================================

create table public.spress_notificacoes (
  id               uuid primary key default gen_random_uuid(),
  destinatario_id  uuid not null references auth.users(id) on delete cascade,
  tipo             text not null,
  titulo           text not null,
  mensagem         text,
  referencia_tipo  text,
  referencia_id    uuid,
  lida             boolean not null default false,
  created_at       timestamptz not null default now()
);

create index idx_spress_notificacoes_destinatario on public.spress_notificacoes(destinatario_id, lida);

alter table public.spress_notificacoes enable row level security;

create policy spress_notificacoes_select on public.spress_notificacoes
  for select using (destinatario_id = auth.uid());
create policy spress_notificacoes_update on public.spress_notificacoes
  for update using (destinatario_id = auth.uid()) with check (destinatario_id = auth.uid());
create policy spress_notificacoes_insert on public.spress_notificacoes
  for insert with check (public.spress_is_staff());
create policy spress_notificacoes_delete on public.spress_notificacoes
  for delete using (destinatario_id = auth.uid());

-- ============================================================
-- 12. SEED — setores iniciais
-- ============================================================

insert into public.spress_setores (nome, descricao, acesso_financeiro) values
  ('Atendimento', 'Coordenação de clientes e distribuição de demandas', false),
  ('Assessoria de Imprensa', 'Pautas, veículos, jornalistas e clipping', false),
  ('Conteúdo/Social Media', 'Redação, design e publicação em redes sociais', false),
  ('Financeiro', 'Contas a pagar/receber e faturamento', true),
  ('Comercial', 'Prospecção e fechamento de novos clientes', false);

commit;
