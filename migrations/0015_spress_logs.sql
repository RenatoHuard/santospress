-- 0015: sistema de log de auditoria para todas as alterações no banco
--
-- Registra automaticamente via trigger qualquer INSERT / UPDATE / DELETE
-- nas tabelas principais. O campo usuario_id captura o usuário logado quando
-- a operação vem do cliente (RLS context); fica null para chamadas via
-- service_role (server actions). O relatório de superadmin será adicionado
-- em sprint futura.

begin;

-- ── 1. Tabela de logs ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.spress_logs (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela            text        NOT NULL,
  operacao          text        NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
  registro_id       text,
  dados_anteriores  jsonb,
  dados_novos       jsonb,
  usuario_id        uuid        REFERENCES public.spress_usuarios(id) ON DELETE SET NULL,
  criado_em         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_spress_logs_tabela     ON public.spress_logs(tabela);
CREATE INDEX idx_spress_logs_criado_em  ON public.spress_logs(criado_em DESC);
CREATE INDEX idx_spress_logs_usuario    ON public.spress_logs(usuario_id);

ALTER TABLE public.spress_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem consultar logs
CREATE POLICY spress_logs_admin_select ON public.spress_logs
  FOR SELECT TO authenticated
  USING (public.spress_is_admin());

-- Service role e trigger (security definer) inserem livremente
CREATE POLICY spress_logs_insert ON public.spress_logs
  FOR INSERT WITH CHECK (true);

-- ── 2. Função trigger de log ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.spress_log_trigger()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_usuario_id uuid;
  v_registro_id text;
BEGIN
  -- Tenta obter o id do usuário spress logado; null para service_role
  BEGIN
    v_usuario_id := public.spress_usuario_id();
  EXCEPTION WHEN OTHERS THEN
    v_usuario_id := null;
  END;

  IF TG_OP = 'DELETE' THEN
    v_registro_id := OLD.id::text;
    INSERT INTO public.spress_logs (tabela, operacao, registro_id, dados_anteriores, dados_novos, usuario_id)
    VALUES (TG_TABLE_NAME, TG_OP, v_registro_id, to_jsonb(OLD), null, v_usuario_id);
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    v_registro_id := NEW.id::text;
    INSERT INTO public.spress_logs (tabela, operacao, registro_id, dados_anteriores, dados_novos, usuario_id)
    VALUES (TG_TABLE_NAME, TG_OP, v_registro_id, null, to_jsonb(NEW), v_usuario_id);
    RETURN NEW;
  ELSE -- UPDATE
    v_registro_id := NEW.id::text;
    INSERT INTO public.spress_logs (tabela, operacao, registro_id, dados_anteriores, dados_novos, usuario_id)
    VALUES (TG_TABLE_NAME, TG_OP, v_registro_id, to_jsonb(OLD), to_jsonb(NEW), v_usuario_id);
    RETURN NEW;
  END IF;
END;
$$;

-- ── 3. Triggers nas tabelas principais ───────────────────────────────────────
CREATE TRIGGER spress_log_blog_posts
  AFTER INSERT OR UPDATE OR DELETE ON public.spress_blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.spress_log_trigger();

CREATE TRIGGER spress_log_usuarios
  AFTER INSERT OR UPDATE OR DELETE ON public.spress_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.spress_log_trigger();

CREATE TRIGGER spress_log_clientes
  AFTER INSERT OR UPDATE OR DELETE ON public.spress_clientes
  FOR EACH ROW EXECUTE FUNCTION public.spress_log_trigger();

commit;
