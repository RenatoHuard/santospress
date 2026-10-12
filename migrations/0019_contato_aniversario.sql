-- Adiciona data de nascimento aos contatos de clientes
ALTER TABLE spress_clientes_contatos
  ADD COLUMN IF NOT EXISTS data_nascimento date;
