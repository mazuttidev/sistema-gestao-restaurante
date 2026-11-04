# Cardápio Certo

Painel web para gestão e geração automatizada dos cardápios semanais do **Restaurante Botafogo** (Bento Gonçalves/RS).
Projeto de extensão do IFRS Campus Bento Gonçalves, componente Projeto Extensionista III (ADS), 2026.

O gestor cadastra os pratos e a estrutura do buffet (9 cubas, 7 rechauds e grelha), o sistema gera a semana de terça a domingo respeitando as regras (pratos fixos, limite de frituras, sem repetição), o gestor ajusta e homologa, e o sistema exporta a impressão semanal da cozinha, o `.txt` diário das etiquetas e a arte 1080×1920 para as redes.

## Stack

- Next.js 16 (App Router) + TypeScript, backend em Node.js
- PostgreSQL + Prisma 7
- Tailwind CSS
- Vitest

## Como rodar

Pré-requisitos: Node.js 22+ e Docker.

```bash
cp .env.example .env      # ajuste os valores se necessário
npm install               # também gera o cliente Prisma
npm run db:up             # sobe o PostgreSQL local (porta 5433)
npm run db:migrate        # cria as tabelas
npx prisma db seed        # estrutura do buffet e pratos de exemplo
npm run dev               # http://localhost:3000
```

## Scripts

| Comando                           | O que faz                                 |
| --------------------------------- | ----------------------------------------- |
| `npm run dev`                     | Servidor de desenvolvimento               |
| `npm run build`                   | Build de produção                         |
| `npm run lint`                    | ESLint                                    |
| `npm run typecheck`               | Gera os tipos de rota e roda o TypeScript |
| `npm run format` / `format:check` | Prettier                                  |
| `npm test` / `test:coverage`      | Testes (Vitest)                           |
| `npm run db:up`                   | Sobe o Postgres local (Docker)            |
| `npm run db:migrate`              | Aplica migrações em desenvolvimento       |
| `npm run db:studio`               | Prisma Studio                             |

## Documentação

- [Planejamento](docs/PLANEJAMENTO.md): escopo, regras de negócio, requisitos, cronograma
- [Persona](docs/PERSONA.md)
- [Análise dos cardápios históricos](docs/ANALISE_CARDAPIOS.md)
- [Modelo de dados](docs/MODELO_DADOS.md)
- [Prompt dos protótipos](docs/PROMPT_PROTOTIPOS.md)

## Fluxo de trabalho

- Uma branch por tarefa (`feat/gerador-semanal`, `fix/txt-acentos`…) e pull request para `main`.
- Commits pequenos, em português, no padrão Conventional Commits (`feat(gerador): respeita limite de fritos`).
- O CI roda formatação, lint, tipos, testes e build em cada PR.
- Os cardápios históricos do restaurante (`referencias/`) não são versionados.

## Equipe

Grupo Cardápio Certo (ADS/IFRS): Bernardo Faccini Marquetti, Gedean Zitkoski, Gustavo de Carli, Jean Carlo de Toni e Victor Mazutti. Coordenação: Prof. Luan Lazzari.
