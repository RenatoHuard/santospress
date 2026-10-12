-- Adiciona colunas que faltam em spress_clientes_contatos
-- (CREATE TABLE IF NOT EXISTS do 0009 foi ignorado pois a tabela já existia com schema anterior)
ALTER TABLE spress_clientes_contatos
  ADD COLUMN IF NOT EXISTS tipo        text DEFAULT 'interlocutor',
  ADD COLUMN IF NOT EXISTS cpf         text,
  ADD COLUMN IF NOT EXISTS whatsapp    text,
  ADD COLUMN IF NOT EXISTS observacoes text,
  ADD COLUMN IF NOT EXISTS ordem       int  DEFAULT 0;
