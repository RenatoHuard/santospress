# Santos Press

Sistema integrado para agência de comunicação 360º (assessoria de imprensa + conteúdo/redes sociais), compartilhando o Supabase do TalkSystem (projeto `acmspixhawkxxfdxqqtw`), isolado via `user_system` + RLS.

Ver `plano-sistema.md` para o mapa completo de módulos, tabelas e roles.

## Estrutura

- `migrations/` — migrations SQL aplicadas ao Supabase, em ordem.
- `types/database.types.ts` — tipos TypeScript gerados do schema (`generate_typescript_types`).
- `plano-sistema.md` — plano do sistema e status por fase.

## Convenções

- Tabelas novas: prefixo `spress_`.
- RLS habilitado em toda tabela `spress_*`, policies via functions `SECURITY DEFINER` (`spress_is_staff()`, `spress_is_admin()`, `spress_cliente_ids()`, etc.) — ver seção RLS em `plano-sistema.md`.
- TEXT + CHECK no lugar de ENUM nativo (mais fácil de evoluir).
