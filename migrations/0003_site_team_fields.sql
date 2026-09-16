-- 0003: campos de equipe para o site institucional + policy pública
begin;

alter table public.spress_usuarios
  add column if not exists foto_url       text,
  add column if not exists descricao_site text;

-- Leitura pública dos membros ativos (página Equipe do site institucional).
-- A query no front seleciona apenas colunas públicas (nome, cargo, foto_url, descricao_site).
create policy spress_usuarios_public_team on public.spress_usuarios
  for select
  to anon
  using (ativo = true);

commit;
