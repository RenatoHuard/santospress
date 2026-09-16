-- Santos Press — hardening pós-advisors
-- 1) spress_set_updated_at ficou sem search_path fixo (diferente das demais funções).
-- 2) Funções helper SECURITY DEFINER não devem ser chamáveis via RPC por anon/authenticated
--    diretamente — são para uso interno em policies RLS. São todas auto-referenciais
--    (baseadas em auth.uid()), então não vazam dados de terceiros, mas a boa prática é
--    restringir EXECUTE explicitamente.

begin;

alter function public.spress_set_updated_at() set search_path = public;

revoke execute on function public.spress_is_member()   from public, anon;
revoke execute on function public.spress_role()          from public, anon;
revoke execute on function public.spress_usuario_id()    from public, anon;
revoke execute on function public.spress_setor_id()      from public, anon;
revoke execute on function public.spress_is_admin()      from public, anon;
revoke execute on function public.spress_is_staff()      from public, anon;
revoke execute on function public.spress_is_financeiro() from public, anon;
revoke execute on function public.spress_cliente_ids()   from public, anon;

grant execute on function public.spress_is_member()   to authenticated;
grant execute on function public.spress_role()          to authenticated;
grant execute on function public.spress_usuario_id()    to authenticated;
grant execute on function public.spress_setor_id()      to authenticated;
grant execute on function public.spress_is_admin()      to authenticated;
grant execute on function public.spress_is_staff()      to authenticated;
grant execute on function public.spress_is_financeiro() to authenticated;
grant execute on function public.spress_cliente_ids()   to authenticated;

-- Trigger function: nunca deve ser chamada diretamente via RPC (só pelo próprio trigger).
revoke execute on function public.spress_log_demanda_coluna_change() from public, anon, authenticated;

commit;
