-- 0012: corrige RLS de spress_usuarios para a página pública /equipe
--
-- Problema: spress_usuarios_write (FOR ALL TO public) e spress_usuarios_select
-- (FOR SELECT TO public) chamam funções helper (spress_is_admin, spress_is_member)
-- que foram revogadas do role anon em 0002. Em PostgreSQL, quando uma policy
-- lança exceção (permission denied), ela não retorna "false" e passa para a próxima
-- policy -- ela aborta a query inteira. Por isso a página pública ficava em branco.
--
-- Correção: restringir ambas as policies para TO authenticated, deixando o anon
-- sujeito APENAS a spress_usuarios_public_team (que usa só `ativo = true`, sem funções).

begin;

-- Recria select policy restrita a authenticated
drop policy if exists spress_usuarios_select on public.spress_usuarios;
create policy spress_usuarios_select on public.spress_usuarios
  for select
  to authenticated
  using (public.spress_is_member());

-- Recria write policy restrita a authenticated
drop policy if exists spress_usuarios_write on public.spress_usuarios;
create policy spress_usuarios_write on public.spress_usuarios
  for all
  to authenticated
  using (public.spress_is_admin() or public.spress_role() = 'atendente')
  with check (public.spress_is_admin() or public.spress_role() = 'atendente');

commit;
