-- ── spress_blog_visitas ────────────────────────────────────────────
-- Rastreamento de visitas por post (anon-friendly: insere sem auth)
CREATE TABLE IF NOT EXISTS spress_blog_visitas (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     uuid REFERENCES spress_blog_posts(id) ON DELETE CASCADE NOT NULL,
  session_id  text,           -- UUID gerado no localStorage do visitante
  referrer    text,           -- document.referrer
  user_agent  text,
  created_at  timestamptz DEFAULT now()
);

-- RLS: qualquer um pode inserir (sem autenticação), nenhum pode ler anonimamente
ALTER TABLE spress_blog_visitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon insert visitas"
  ON spress_blog_visitas
  FOR INSERT TO anon
  WITH CHECK (true);

-- Service role (servidor) pode fazer tudo — necessário para o dashboard
-- (service_role bypasses RLS automaticamente)

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_blog_visitas_post_id    ON spress_blog_visitas (post_id);
CREATE INDEX IF NOT EXISTS idx_blog_visitas_created_at ON spress_blog_visitas (created_at);
CREATE INDEX IF NOT EXISTS idx_blog_visitas_session    ON spress_blog_visitas (session_id);
