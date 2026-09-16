-- ── spress_clientes ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spress_clientes (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Empresa (PJ)
  razao_social   text,
  nome_fantasia  text,
  cnpj           text,
  inscricao_estadual  text,
  inscricao_municipal text,
  segmento       text,
  -- Endereço
  cep            text,
  logradouro     text,
  numero         text,
  complemento    text,
  bairro         text,
  cidade         text,
  uf             text,
  -- Contato geral
  telefone       text,
  email          text,
  site_url       text,
  -- Status
  status         text DEFAULT 'ativo',
  observacoes    text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- ── spress_clientes_contatos ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spress_clientes_contatos (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id  uuid REFERENCES spress_clientes(id) ON DELETE CASCADE NOT NULL,
  tipo        text DEFAULT 'interlocutor',  -- responsavel_legal | interlocutor
  nome        text NOT NULL,
  cargo       text,
  cpf         text,
  telefone    text,
  whatsapp    text,
  email       text,
  observacoes text,
  ordem       int DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- ── spress_clientes_financeiro ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS spress_clientes_financeiro (
  cliente_id      uuid REFERENCES spress_clientes(id) ON DELETE CASCADE PRIMARY KEY,
  email_financeiro text,
  banco           text,
  agencia         text,
  conta           text,
  tipo_conta      text,
  pix             text,
  observacoes     text,
  updated_at      timestamptz DEFAULT now()
);

-- ── spress_clientes_contratos ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS spress_clientes_contratos (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id  uuid REFERENCES spress_clientes(id) ON DELETE CASCADE NOT NULL,
  titulo      text NOT NULL,
  descricao   text,
  valor       decimal(12, 2),
  data_inicio date,
  data_fim    date,
  status      text DEFAULT 'ativo',  -- ativo | encerrado | suspenso
  arquivo_url text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ── spress_clientes_crm ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spress_clientes_crm (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id     uuid REFERENCES spress_clientes(id) ON DELETE CASCADE NOT NULL,
  tipo           text DEFAULT 'nota',  -- nota | campanha | briefing | aprovacao | reuniao
  titulo         text,
  descricao      text,
  data           date DEFAULT CURRENT_DATE,
  responsavel_id uuid REFERENCES spress_usuarios(id) ON DELETE SET NULL,
  created_at     timestamptz DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────────────
ALTER TABLE spress_clientes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE spress_clientes_contatos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE spress_clientes_financeiro  ENABLE ROW LEVEL SECURITY;
ALTER TABLE spress_clientes_contratos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE spress_clientes_crm         ENABLE ROW LEVEL SECURITY;
-- Service role bypasses RLS → server actions têm acesso total

-- ── Storage para contratos ──────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('contratos-clientes', 'contratos-clientes', false)
ON CONFLICT (id) DO NOTHING;
