-- 0017: sistema de convites para auto-cadastro de colaboradores

begin;

create table if not exists public.spress_convites (
  id           uuid primary key default gen_random_uuid(),
  token        uuid not null default gen_random_uuid() unique,
  nome_sugerido text,
  cargo_sugerido text,
  setor_id     uuid references public.spress_setores(id) on delete set null,
  role         text not null default 'colaborador',
  criado_por   uuid references public.spress_usuarios(id) on delete set null,
  expires_at   timestamptz not null default now() + interval '7 days',
  usado_em     timestamptz,
  usado_por    uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_convites_token on public.spress_convites(token);

alter table public.spress_convites enable row level security;

-- Apenas staff pode criar/ver convites; leitura pública pelo token (validação no convite público)
do $$ begin
  if not exists (select 1 from pg_policies where tablename='spress_convites' and policyname='convites_staff') then
    execute 'create policy convites_staff on public.spress_convites for all to authenticated using (spress_is_staff()) with check (spress_is_staff())';
  end if;
  -- Leitura anon por token para a página pública
  if not exists (select 1 from pg_policies where tablename='spress_convites' and policyname='convites_anon_read') then
    execute 'create policy convites_anon_read on public.spress_convites for select to anon using (usado_em is null and expires_at > now())';
  end if;
end $$;

-- Campo pendente em spress_usuarios para sinalizar cadastros aguardando aprovação
alter table public.spress_usuarios
  add column if not exists pendente_aprovacao boolean not null default false;

commit;
