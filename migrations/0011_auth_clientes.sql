-- ── Garante todas as colunas de spress_clientes ──────────────────────
-- O CREATE TABLE IF NOT EXISTS do 0009 é pulado se a tabela já existia
-- numa versão anterior sem estes campos. Este script é idempotente.

-- Empresa
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS razao_social        text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS nome_fantasia        text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS cnpj                 text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS inscricao_estadual   text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS inscricao_municipal  text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS segmento             text;

-- Endereço
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS cep                  text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS logradouro           text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS numero               text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS complemento          text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS bairro               text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS cidade               text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS uf                   text;

-- Contato
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS telefone             text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS email                text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS site_url             text;

-- Status e meta
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS status               text DEFAULT 'ativo';
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS observacoes          text;
ALTER TABLE spress_clientes ADD COLUMN IF NOT EXISTS updated_at           timestamptz DEFAULT now();

-- Auth: liga o cliente ao Supabase Auth para login
ALTER TABLE spress_clientes
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── Índices ───────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_auth_user_id
  ON spress_clientes(auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- ── Políticas RLS ─────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'spress_clientes'
      AND policyname = 'cliente lê próprio perfil'
  ) THEN
    EXECUTE 'CREATE POLICY "cliente lê próprio perfil"
      ON spress_clientes FOR SELECT TO authenticated
      USING (auth_user_id = auth.uid())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'spress_clientes'
      AND policyname = 'cliente atualiza próprio perfil'
  ) THEN
    EXECUTE 'CREATE POLICY "cliente atualiza próprio perfil"
      ON spress_clientes FOR UPDATE TO authenticated
      USING (auth_user_id = auth.uid())';
  END IF;
END $$;
