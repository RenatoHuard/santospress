-- Tabela de conteúdo editável do site (chave-valor por seção)
CREATE TABLE IF NOT EXISTS spress_conteudo_site (
  secao text NOT NULL,
  chave text NOT NULL,
  valor text,
  PRIMARY KEY (secao, chave)
);

-- Leitura pública (anon pode ler para renderizar o site)
ALTER TABLE spress_conteudo_site ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "leitura_publica" ON spress_conteudo_site;
CREATE POLICY "leitura_publica" ON spress_conteudo_site FOR SELECT USING (true);

-- Seed com valores padrão (idempotente)
INSERT INTO spress_conteudo_site (secao, chave, valor) VALUES
  -- Hero
  ('hero','badge','Santos/SP · Comunicação Integrada'),
  ('hero','headline1','Comunicação que'),
  ('hero','headline2','transforma marcas.'),
  ('hero','subtitulo','Assessoria de imprensa, social media e marketing integrado para posicionar sua empresa, entidade ou marca com inteligência junto à mídia e ao mercado.'),
  ('hero','cta1_texto','Nossos Serviços'),
  ('hero','cta1_href','#servicos'),
  ('hero','cta2_texto','Conheça a SantosPress'),
  ('hero','cta2_href','#sobre'),
  -- Sobre
  ('sobre','badge','Sobre nós'),
  ('sobre','titulo','Comunicação integrada que cria oportunidades'),
  ('sobre','paragrafo1','A SantosPress nasceu para atender empresas, entidades e personalidades que buscam um posicionamento adequado junto à mídia — criando novas oportunidades de negócios com presença e consistência.'),
  ('sobre','paragrafo2','Trabalhamos com o conceito de comunicação integrada, explorando a sinergia entre planejamento estratégico, relações com a mídia e pautas contextualizadas para cada momento.'),
  ('sobre','stat1_valor','+10'),
  ('sobre','stat1_label','Anos de experiência'),
  ('sobre','stat2_valor','+80'),
  ('sobre','stat2_label','Clientes atendidos'),
  ('sobre','stat3_valor','+500'),
  ('sobre','stat3_label','Matérias publicadas'),
  ('sobre','stat4_valor','+120'),
  ('sobre','stat4_label','Veículos parceiros'),
  -- Serviços
  ('servicos','badge','O que fazemos'),
  ('servicos','titulo','Serviços especializados em comunicação'),
  -- Blog
  ('blog','badge','Conteúdo'),
  ('blog','titulo','Últimas do Blog'),
  -- CTA
  ('cta','badge','Fale conosco'),
  ('cta','titulo','Vamos conversar?'),
  ('cta','subtitulo','Estamos em Santos/SP e prontos para transformar a comunicação da sua empresa. Entre em contato e descubra como podemos ajudar.'),
  ('cta','cta1_texto','Enviar mensagem'),
  ('cta','cta1_href','mailto:contato@santospress.com.br'),
  ('cta','cta2_texto','Seguir no Instagram'),
  ('cta','cta2_href','https://www.instagram.com/santospress/'),
  ('cta','endereco','Rua Quintino Bocaiuva, 03, Gonzaga — Santos/SP')
ON CONFLICT (secao, chave) DO NOTHING;
