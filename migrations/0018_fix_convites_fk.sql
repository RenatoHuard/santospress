-- 0018: corrige FK de criado_por para referenciar auth.users em vez de spress_usuarios
-- Motivo: o admin pode ter uid no Auth sem row em spress_usuarios (ex.: conta criada direto no Supabase Dashboard)

begin;

alter table public.spress_convites
  drop constraint if exists spress_convites_criado_por_fkey;

alter table public.spress_convites
  add constraint spress_convites_criado_por_fkey
  foreign key (criado_por) references auth.users(id) on delete set null;

commit;
