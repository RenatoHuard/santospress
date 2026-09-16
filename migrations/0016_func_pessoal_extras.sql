-- 0016: campos extras em spress_func_pessoal
-- RG completo, parentesco emergência, portfólio, camiseta, restrições alimentares

begin;

alter table public.spress_func_pessoal
  add column if not exists rg_orgao_emissor      text,
  add column if not exists rg_data_expedicao     date,
  add column if not exists emergencia_parentesco text,
  add column if not exists portfolio_url         text,
  add column if not exists tamanho_camiseta      text,
  add column if not exists restricoes_alimentares text;

commit;
