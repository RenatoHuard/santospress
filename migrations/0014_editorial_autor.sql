-- 0014: autor coringa "Redação SantosPress" + importação da primeira postagem do site
--
-- Problema: spress_blog_posts.autor_id referencia spress_usuarios, mas usuários editoriais
-- (bylines sem login próprio) não têm conta no auth.users. A solução é:
--   1. Tornar auth_user_id nullable (apenas para contas editoriais)
--   2. Adicionar flag is_coringa para distingui-las de funcionários reais
--   3. Atualizar a policy pública /equipe para excluir contas coringa

begin;

-- ── 1. Permite auth_user_id nulo em contas editoriais ────────────────────────
ALTER TABLE public.spress_usuarios
  ALTER COLUMN auth_user_id DROP NOT NULL;

-- ── 2. Flag de conta editorial/coringa ───────────────────────────────────────
ALTER TABLE public.spress_usuarios
  ADD COLUMN IF NOT EXISTS is_coringa boolean NOT NULL DEFAULT false;

-- ── 3. Atualiza policy pública /equipe para excluir contas coringa ────────────
-- A policy anterior (0003) usava apenas `ativo = true`; coringa também é ativo
-- mas não deve aparecer na página de equipe.
DROP POLICY IF EXISTS spress_usuarios_public_team ON public.spress_usuarios;
CREATE POLICY spress_usuarios_public_team ON public.spress_usuarios
  FOR SELECT TO anon
  USING (ativo = true AND is_coringa = false);

-- ── 4. Insere autor coringa "Redação SantosPress" ─────────────────────────────
-- Usado como byline padrão quando não há um autor nomeado.
-- ativo = true para aparecer no dropdown de autores do editor de blog.
-- is_coringa = true para ser excluído da página pública /equipe.
INSERT INTO public.spress_usuarios (
  auth_user_id,
  nome,
  nome_site,
  email,
  cargo,
  role,
  ativo,
  is_coringa,
  foto_url,
  descricao_site
) VALUES (
  null,
  'Redação SantosPress',
  'Redação SantosPress',
  'redacao@santospress.com.br',
  'Equipe Editorial',
  'colaborador',
  true,
  true,
  null,
  'Conteúdo produzido pela equipe editorial da SantosPress.'
);

-- ── 5. Importa postagem do site atual (02/09/2026) ────────────────────────────
INSERT INTO public.spress_blog_posts (
  titulo,
  slug,
  resumo,
  conteudo,
  capa_url,
  status,
  autor_id,
  seo_titulo,
  seo_descricao,
  tags,
  categoria,
  publicado_em
) VALUES (
  'Ascensão do uso de medicamentos para emagrecimento impacta a cirurgia plástica',
  'ascensao-do-uso-de-medicamentos-para-emagrecimento-impacta-a-cirurgia-plastica',
  'Especialista explica o momento certo para retirar o excesso de pele com o emagrecimento usando canetas emagrecedoras',
  '<p>De acordo com um estudo realizado pela Scanntech, o uso de medicamentos para emagrecimento cresceu 239% no primeiro trimestre de 2026 em comparação com o ano anterior. Esse aumento expressivo já se reflete nos consultórios de cirurgia plástica, com pacientes que perderam muito peso em pouco tempo e agora enfrentam o desafio do excesso de pele.</p>

<p>A cirurgiã plástica Dra. Carolina Cescato explica que o uso dos novos medicamentos para tratamento da obesidade mudou bastante o perfil dos pacientes que chegam ao consultório. "Hoje vemos pessoas perdendo uma quantidade significativa de peso em períodos relativamente curtos e, como consequência, apresentando flacidez e excesso de pele em diferentes regiões do corpo. Por isso, é natural que aumente também a procura por cirurgias de contorno corporal. O objetivo, nesses casos, não é simplesmente retirar pele, mas adequar o contorno corporal à nova realidade do paciente, sempre respeitando sua saúde e o momento adequado para operar".</p>

<p>Segundo a especialista, mais importante do que quantos quilos o paciente perdeu é saber se o emagrecimento já está estabilizado. "Em geral, consideramos cirurgia quando o paciente está próximo do peso planejado, consegue mantê-lo estável por um período, apresenta boas condições nutricionais e clínicas e o excesso de pele já causa incômodo estético ou funcional". Ela esclarece que não é só chegar a determinado número na balança, mas chegar ao momento em que o corpo está preparado para a cirurgia.</p>

<p>Uma grande perda de peso pode vir acompanhada de redução de massa muscular e deficiências nutricionais, mesmo quando o paciente aparentemente esteja bem. A avaliação pré-operatória precisa ser global. Antes da cirurgia, é avaliado estabilidade do peso, alimentação, proteínas, vitaminas, ferro e outros nutrientes, além de anemia, doenças associadas, medicamentos em uso e risco de trombose.</p>

<p>Nos pacientes que utilizam medicamentos para emagrecimento, também é fundamental planejar adequadamente o período perioperatório (ciclo completo que abrange toda a experiência cirúrgica de um paciente: pré-operatório, transoperatório e pós-operatório), porque alguns deles podem interferir no esvaziamento do estômago e exigir cuidados específicos relacionados à anestesia. "Antes de retirar o excesso de pele, precisamos ter certeza de que o organismo está pronto para cicatrizar", afirma Cescato.</p>

<p>O impacto do excesso de pele vai além da estética. Depois de uma grande perda de peso, o excesso de pele pode dificultar a percepção dos resultados conquistados. Além da questão estética, ele pode interferir na escolha das roupas, na prática de exercícios, na intimidade e no conforto do dia a dia. "Existe uma situação que ouvimos com frequência: &#8216;Eu emagreci, mas ainda não me reconheço no meu corpo.&#8217; Para muitos pacientes, perder peso é uma etapa da transformação. Reconstruir o contorno corporal pode ser a etapa seguinte."</p>

<p>O número de pessoas que perderam muito peso por tratamento medicamentoso, sem necessariamente terem passado por cirurgia bariátrica, só cresce. Isso cria um novo perfil de paciente. Com isso a abordagem tem que mudar, é preciso avaliar não apenas o excesso de pele, mas a qualidade dos tecidos, a perda de volume, a massa muscular, o estado nutricional e a possibilidade de combinar ou dividir procedimentos em etapas. "Os medicamentos mudaram a forma de emagrecer e também estão mudando a cirurgia plástica pós-emagrecimento", assegura Carol.</p>

<p>Esse movimento mostra que a cirurgia plástica pós-emagrecimento tende a ocupar um espaço cada vez maior, mas sempre com uma premissa: o tratamento precisa ser individualizado, respeitando o tempo e as condições de cada paciente.</p>',
  null,
  'publicado',
  (SELECT id FROM public.spress_usuarios WHERE is_coringa = true LIMIT 1),
  'Ascensão do uso de medicamentos para emagrecimento impacta a cirurgia plástica',
  'Especialista explica o momento certo para retirar o excesso de pele com o emagrecimento usando canetas emagrecedoras',
  ARRAY['cirurgia plástica', 'emagrecimento', 'saúde', 'medicamentos'],
  'Saúde',
  '2026-09-02T12:00:00+00:00'
);

commit;
