-- 0013: documentos de colaboradores + valores de benefícios

begin;

-- Valores de benefícios (visíveis apenas a admin/financeiro)
alter table public.spress_func_bancario
  add column if not exists beneficio_vt_valor     numeric(10,2),
  add column if not exists beneficio_va_valor     numeric(10,2),
  add column if not exists beneficio_vr_valor     numeric(10,2),
  add column if not exists beneficio_saude_valor  numeric(10,2),
  add column if not exists beneficio_odonto_valor numeric(10,2);

-- URLs dos arquivos de ASO na tabela de saúde
alter table public.spress_func_saude
  add column if not exists aso_admissional_url text,
  add column if not exists aso_periodico_url   text,
  add column if not exists aso_retorno_url     text;

-- Atestados médicos
create table if not exists public.spress_func_atestados (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references public.spress_usuarios(id) on delete cascade,
  data        date not null,
  descricao   text,
  arquivo_url text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_func_atestados_usuario on public.spress_func_atestados(usuario_id);

-- Notas de serviço
create table if not exists public.spress_func_notas_servico (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references public.spress_usuarios(id) on delete cascade,
  data        date not null,
  descricao   text,
  valor       numeric(12,2),
  arquivo_url text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_func_notas_usuario on public.spress_func_notas_servico(usuario_id);

-- RLS
alter table public.spress_func_atestados    enable row level security;
alter table public.spress_func_notas_servico enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='spress_func_atestados' and policyname='atestados_staff') then
    execute 'create policy atestados_staff on public.spress_func_atestados for all to authenticated using (spress_is_staff()) with check (spress_is_staff())';
  end if;
  if not exists (select 1 from pg_policies where tablename='spress_func_atestados' and policyname='atestados_proprio') then
    execute 'create policy atestados_proprio on public.spress_func_atestados for all to authenticated using (usuario_id = spress_usuario_id()) with check (usuario_id = spress_usuario_id())';
  end if;
  if not exists (select 1 from pg_policies where tablename='spress_func_notas_servico' and policyname='notas_staff') then
    execute 'create policy notas_staff on public.spress_func_notas_servico for all to authenticated using (spress_is_staff()) with check (spress_is_staff())';
  end if;
  if not exists (select 1 from pg_policies where tablename='spress_func_notas_servico' and policyname='notas_proprio') then
    execute 'create policy notas_proprio on public.spress_func_notas_servico for all to authenticated using (usuario_id = spress_usuario_id()) with check (usuario_id = spress_usuario_id())';
  end if;
end $$;

commit;
