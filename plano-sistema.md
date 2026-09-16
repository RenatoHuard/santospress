# Santos Press — Plano do Sistema Integrado

Atualizado: 2026-08-27

## Decisões confirmadas

- Modelo: agência única (Santos Press). Sem tabela de tenant/agência, sem `agencia_id` nas tabelas.
- Setores: Assessoria de Imprensa, Conteúdo/Social Media, Financeiro, Comercial, Atendimento. Atendentes também publicam Blog/Site.
- Financeiro: controle interno (contas a pagar/receber, faturamento). Sem emissão fiscal por enquanto.
- Prefixo de tabelas: `spress_`.
- Isolamento: tabela `user_system` (nova, ainda não existe no banco) vincula `auth.users` ao sistema (`talklocal` | `spress`). RLS em toda tabela `spress_*` valida contra ela.

## Roles

- `admin` — acesso total, gestão de usuários, financeiro, contratos.
- `atendente` — coordena clientes, cria/distribui demandas, publica blog/site.
- `colaborador` — membro de um setor (imprensa, conteúdo, comercial, financeiro), executa demandas atribuídas.
- `cliente` — portal externo: abre pedidos, acompanha kanban do próprio card, aprova conteúdo.

## Mapa de tabelas (prefixo `spress_`)

### Infra / Sistema
- `user_system` — user_id (FK auth.users), sistema (enum: talklocal/spress), created_at. Compartilhada entre os dois sistemas.
- `spress_setores` — departamentos.
- `spress_usuarios` — perfil interno (auth.users + nome, cargo, setor_id, role, ativo).

### Cadastro
- `spress_clientes` — empresas atendidas (razão social, CNPJ, atendente_responsavel_id, status, plano).
- `spress_clientes_contatos` — pessoas de contato, vinculável a auth.users para portal do cliente.
- `spress_contratos` — serviços contratados por cliente (imprensa/conteúdo/blog), vigência, valor.

### Kanban / Demandas (núcleo)
- `spress_quadros` — boards (por cliente ou por setor).
- `spress_colunas` — colunas do board (Backlog, Em andamento, Aprovação Cliente, Concluído...).
- `spress_demandas` — cards: título, descrição, cliente_id, setor_id, atendente_id, responsavel_id, coluna_id, prioridade, prazo, origem (cliente/atendente), tipo.
- `spress_demanda_checklist` — subtarefas.
- `spress_demanda_comentarios` — comentários estilo chat no card.
- `spress_demanda_anexos` — arquivos.
- `spress_demanda_historico` — log de movimentação entre colunas/status.
- `spress_labels` / `spress_demanda_labels` — etiquetas.

### Assessoria de Imprensa
- `spress_veiculos_imprensa` — veículos (nome, tipo, abrangência).
- `spress_jornalistas` — contatos vinculados a veículos.
- `spress_pautas` — pautas enviadas (cliente, veículos alvo, demanda_id).
- `spress_clipping` — menções captadas (cliente, veículo, link, data, alcance/valor de mídia).

### Conteúdo / Social Media
- `spress_redes_sociais_contas` — contas do cliente por plataforma.
- `spress_publicacoes` — posts planejados (cliente, rede, status, data agendada, demanda_id).
- `spress_publicacoes_midias` — imagens/vídeos do post.

### Blog / Site
- `spress_blog_posts` — posts do blog institucional da Santos Press (sem `cliente_id`; não é por cliente). Leitura pública quando `status = 'publicado'`.
- `spress_paginas_site` — blocos de conteúdo editável do site institucional. Leitura pública quando `status = 'publicado'`.

### Financeiro (controle interno)
- `spress_categorias_financeiras`.
- `spress_contas_receber` — faturas a clientes (contrato_id, valor, vencimento, status).
- `spress_contas_pagar` — despesas (fornecedores, freelancers).

### Notificações
- `spress_notificacoes` — novo card, comentário, prazo próximo.

## RLS

- RLS habilitado em toda tabela `spress_*`.
- Função helper `spress_is_member(uid)` → `EXISTS (SELECT 1 FROM user_system WHERE user_id = uid AND sistema = 'spress')`.
- Função helper `spress_current_role(uid)` → lê `spress_usuarios.role`.
- Policies por papel:
  - admin: acesso total dentro do sistema.
  - atendente/colaborador: leitura/escrita nas demandas do próprio setor ou cliente sob sua responsabilidade.
  - cliente: leitura/escrita restrita às linhas do próprio `cliente_id` (via `spress_clientes_contatos.auth_user_id`), sem acesso a financeiro interno nem dados de outros clientes.

## Status

**Fase 1 concluída (2026-08-27):** schema aplicado no Supabase (projeto `acmspixhawkxxfdxqqtw`).

- `migrations/0001_init_spress.sql` — 29 tabelas `spress_*` + `user_system`, RLS, functions helper, seed de setores.
- `migrations/0002_harden_functions.sql` — correção de `search_path` e restrição de `EXECUTE` (`anon`) nas functions `SECURITY DEFINER`, conforme `get_advisors`.
- `types/database.types.ts` — tipos TypeScript gerados do schema completo do projeto (TalkLocal + Santos Press).
- Repositório Git local inicializado (`santospress`), remoto: https://github.com/RenatoHuard/santospress — push pendente (sessão sem credenciais de GitHub; ver próximos passos).
- `get_advisors` (security): 0 problemas nas tabelas/functions `spress_*`. Alertas restantes no projeto são todos pré-existentes do TalkLocal, fora de escopo.

**Fase 2 concluída (2026-08-28):** site institucional scaffolado em `site/`.

- `migrations/0003_site_team_fields.sql` — `foto_url` e `descricao_site` em `spress_usuarios` + policy pública `spress_usuarios_public_team` (anon lê apenas `ativo = true`). Aplicada no Supabase.
- `site/` — Next.js 14 (App Router) + Tailwind CSS + `@supabase/supabase-js`.
  - Páginas: `/` (Home), `/blog` (listagem), `/blog/[slug]` (post), `/equipe`, `/login`.
  - Home atualiza seção "Últimas do Blog" dinamicamente (revalidate 60s) a partir de `spress_blog_posts` status=publicado.
  - Equipe carrega membros ativos em tempo real de `spress_usuarios` (ativo=true) com nome, cargo, foto_url, descricao_site.
  - Login autentica via Supabase Auth e redireciona para `/sistema`.
  - Configurar `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ver `.env.local.example`).

**Fase 3 concluída (2026-09-11):** sistema interno scaffolado em `site/app/sistema/`.

- Login funcional com Supabase Auth, redirecionamento para `/sistema`.
- Blog/CMS completo: editor TipTap, upload de imagem, relatórios de audiência (pageviews por dia + paginação), importação de artigos do WordPress.
- `migrations/0004_*` — view `spress_blog_post_view_counts`, tabela `spress_blog_visitas`.

## Ordem de ataque — próximas fases

Princípio: *arrumar a casa antes de crescer* — trazer o que já existe para dentro do sistema e ter visibilidade do cenário atual antes de pensar em nova aquisição.

| Fase | Módulo | O que construir | Tabelas já existem? |
|------|--------|-----------------|-------------------|
| **4ª** | Cadastro de Colaboradores | Tela de listagem/edição de `spress_usuarios`, setores, cargos | ✅ |
| **5ª** | RH básico — Ponto e Frequência | Registro de entrada/saída, relatório mensal, férias e afastamentos | ❌ (nova migration) |
| **6ª** | Cadastro de Clientes | Importar base atual, ficha completa, status, contrato vinculado | ✅ |
| **7ª** | Financeiro — cenário atual | Contas a receber/pagar, fluxo de caixa, inadimplência | ✅ |
| **8ª** | Kanban / Demandas | Board por cliente ou setor, cards, checklist, comentários | ✅ |
| **9ª** | CRM — histórico | Timeline de interações, follow-ups, segmentação de clientes | ✅ (estende spress_clientes) |
| **10ª** | RP | Pautas, banco de jornalistas/veículos, clipping | ✅ |
| **11ª** | Conteúdo / Social Media | Calendário editorial, publicações por cliente e rede | ✅ |
| **12ª** | Portal do Cliente | Acesso externo: kanban próprio, aprovação de conteúdo | ✅ (role cliente) |
| **13ª** | Aquisição / Funil de Vendas | Pipeline, propostas, contratos digitais | ❌ (nova migration) |
| **14ª** | Contábil | DRE, exportação para contador, integração fiscal | ❌ (nova migration) |
