# Cardápio Certo — Restaurante Botafogo

Painel web para gestão e geração automatizada de cardápios semanais. Contexto em `docs/PLANEJAMENTO.md`, persona em `docs/PERSONA.md`, tarefas no Notion (banco "Tarefas — Cardápio Certo").

## Desenvolvimento

- Next.js 16 tem mudanças incompatíveis com versões anteriores: ler `AGENTS.md` e o guia em `node_modules/next/dist/docs/` antes de escrever código do Next.
- Prisma 7: cliente gerado em `src/generated/prisma` (importar de `@/generated/prisma/client`), conexão via `@prisma/adapter-pg`, configuração em `prisma.config.ts`.
- Antes de concluir uma tarefa: `npm run format:check && npm run lint && npm run typecheck && npm test`.
- Atualizar o status da tarefa no Notion ao começar (Em andamento) e ao terminar (Em revisão/Concluído).
- `referencias/` (cardápios históricos do restaurante) nunca vai para o Git.

## Regras de commit

- **Claude nunca é coautor.** Não adicionar `Co-Authored-By: Claude`, "Generated with Claude Code" nem nenhuma menção ao Claude ou à Anthropic em mensagens de commit, descrições de PR, comentários ou código.
- **Commits pequenos e atômicos.** Cada commit faz uma única coisa. Se a alteração mistura assuntos (ex.: feature + refatoração + docs), dividir em vários commits, usando `git add -p` ou adicionando arquivo por arquivo.
- **Mensagens claras, em português, no padrão Conventional Commits:**

  ```
  <tipo>(<escopo>): <resumo no imperativo, até 72 caracteres>

  <corpo opcional: o porquê da mudança, não o como>
  ```

  - Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `build`, `ci`.
  - Escopos sugeridos: `pratos`, `regras`, `gerador`, `semana`, `exportacao`, `auth`, `ui`, `db`, `infra`.
  - Resumo sem ponto final, começando com verbo no imperativo ("adiciona", "corrige", "remove").
  - Exemplos:
    - `feat(gerador): respeita limite de fritos por dia`
    - `fix(exportacao): corrige acentuação no .txt das etiquetas`
    - `test(gerador): cobre caso de repertório insuficiente`
    - `docs: adiciona planejamento e persona do projeto`

- Nunca commitar segredos (`.env`, chaves, senhas).
- Só fazer commit ou push quando o usuário pedir.
