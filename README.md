# Cardápio Certo

Painel web para gestão e geração automatizada dos cardápios semanais do **Restaurante Botafogo** (Bento Gonçalves/RS).
Projeto de extensão do IFRS Campus Bento Gonçalves, componente Projeto Extensionista III (ADS), 2026.

O gestor cadastra os pratos e a estrutura do buffet (9 cubas, 7 rechauds e grelha), o sistema gera a semana de terça a domingo respeitando as regras (pratos fixos, limite de frituras, sem repetição), o gestor ajusta e homologa, e o sistema exporta a impressão semanal da cozinha, o `.txt` diário das etiquetas e a arte 1080×1920 para as redes.

## Funcionalidades

| Tela          | O que faz                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| **Login**     | Acesso do gestor (sessão em cookie, senha com hash).                                                           |
| **Pratos**    | Cadastro, categoria, método de preparo, restrições, busca, filtros e ativar/inativar.                          |
| **Regras**    | Dias de funcionamento, limite de fritos, janela de não repetição e estrutura do buffet (posições).             |
| **Semana**    | Gera a semana, mostra a grade com indicadores por dia, troca/trava pratos, regenera um dia, homologa e reabre. |
| **Exportar**  | Na semana homologada: impressão A4, `.txt` das etiquetas, arte 1080×1920 px e texto do dia para WhatsApp.      |
| **Histórico** | Semanas anteriores com status.                                                                                 |

## Stack

- Next.js 16 (App Router) + TypeScript, backend em Node.js (server actions e route handlers)
- PostgreSQL 17 + Prisma 7 (`@prisma/adapter-pg`)
- Tailwind CSS 4
- Autenticação própria: JWT (`jose`) em cookie + `scrypt`
- Arte do dia com `next/og` (Satori)
- Vitest

## Como rodar o projeto

### 1. Pré-requisitos

| Ferramenta | Versão  | Para quê                               |
| ---------- | ------- | -------------------------------------- |
| Node.js    | 22+     | Rodar o Next.js e os scripts           |
| npm        | 10+     | Instalar dependências (vem com o Node) |
| Docker     | recente | Subir o PostgreSQL local               |
| Git        | —       | Clonar o repositório                   |

No macOS sem Docker Desktop, o [Colima](https://github.com/abiosoft/colima) funciona: `brew install colima docker docker-compose && colima start`.

### 2. Clonar e instalar

```bash
git clone https://github.com/mazuttidev/sistema-gestao-restaurante.git
cd sistema-gestao-restaurante
npm install
```

O `npm install` também gera o cliente do Prisma em `src/generated/prisma`.

### 3. Configurar o `.env`

```bash
cp .env.example .env
```

Preencha:

| Variável           | Valor                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| `DATABASE_URL`     | Já vem apontando para o banco do Docker (porta 5433). Só mude se usar outro banco. |
| `AUTH_SECRET`      | Segredo da sessão, **mínimo 32 caracteres**. Gere com `openssl rand -base64 32`.   |
| `SEED_ADMIN_NOME`  | Nome do gestor (ex.: `Carlos`).                                                    |
| `SEED_ADMIN_EMAIL` | E-mail usado no login.                                                             |
| `SEED_ADMIN_SENHA` | Senha do login, **mínimo 8 caracteres**. Nunca vai para o código nem para o Git.   |

### 4. Subir o banco

```bash
npm run db:up
```

Sobe um PostgreSQL 17 no Docker (`localhost:5433`, usuário e senha `cardapio`, banco `cardapio_certo`). Os dados ficam no volume `db-data` e sobrevivem a reinícios.

### 5. Criar as tabelas

```bash
npm run db:migrate
```

### 6. Carregar os dados iniciais

```bash
npx prisma db seed
```

Cria a configuração padrão (terça a domingo, limite de 4 fritos, sem repetir a semana anterior), a estrutura do buffet (18 posições), o catálogo consolidado dos cardápios históricos e o **usuário gestor** com os dados do `.env`. Pode rodar de novo sem duplicar nada.

O catálogo em `prisma/pratos-historicos.json` contém nome, categoria, preparo, cubas e observações para revisão em **Pratos**. O [relatório de consolidação](docs/importacao-pratos/relatorio.md) registra duplicatas e entradas rejeitadas. Queijo usa rodízio variável; as demais categorias livres têm repertório para duas semanas sem repetição. O seed preserva alterações feitas pelo gestor em execuções seguintes.

### 7. Rodar

```bash
npm run dev
```

Abra <http://localhost:3000> e entre com `SEED_ADMIN_EMAIL` e `SEED_ADMIN_SENHA`.

### 8. Primeiro uso

1. **Regras**: confira os dias de funcionamento, o limite de fritos e as posições do buffet.
2. **Pratos**: revise os pratos cadastrados e inclua os que faltarem.
3. **Semana** → **Gerar cardápio da semana**. Ajuste o que quiser clicando nos pratos (o prato trocado fica travado).
4. **Homologar**. Aparece o painel **Exportar** com impressão, `.txt`, arte e texto de cada dia.

### Resumo

```bash
npm install
cp .env.example .env          # preencha AUTH_SECRET e SEED_ADMIN_*
npm run db:up
npm run db:migrate
npx prisma db seed
npm run dev                   # http://localhost:3000
```

### Build de produção local

```bash
npm run build
npm start                     # http://localhost:3000
```

### Problemas comuns

| Sintoma                                          | Solução                                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `AUTH_SECRET ausente ou curto`                   | Defina `AUTH_SECRET` com 32+ caracteres no `.env` e reinicie o `npm run dev`.         |
| `Can't reach database server at localhost:5433`  | O banco não está no ar: `npm run db:up` (e `colima start`, se usar Colima).           |
| `failed to connect to the docker API`            | Docker parado: abra o Docker Desktop ou rode `colima start`.                          |
| Login recusado logo após instalar                | O gestor não foi criado: preencha `SEED_ADMIN_*` e rode `npx prisma db seed` de novo. |
| `Cannot find module '@/generated/prisma/client'` | Rode `npm run db:generate`.                                                           |
| Porta 3000 ocupada                               | `npm run dev -- --port 3001`.                                                         |
| Quero zerar o banco                              | `npx prisma migrate reset` (apaga todos os dados) e depois `npx prisma db seed`.      |

## Scripts

| Comando                           | O que faz                                 |
| --------------------------------- | ----------------------------------------- |
| `npm run dev`                     | Servidor de desenvolvimento               |
| `npm run build` / `npm start`     | Build e servidor de produção              |
| `npm run lint`                    | ESLint                                    |
| `npm run typecheck`               | Gera os tipos de rota e roda o TypeScript |
| `npm run format` / `format:check` | Prettier                                  |
| `npm test` / `test:coverage`      | Testes (Vitest) e cobertura               |
| `npm run db:up`                   | Sobe o Postgres local (Docker)            |
| `npm run db:migrate`              | Aplica migrações em desenvolvimento       |
| `npm run db:generate`             | Gera o cliente Prisma                     |
| `npm run db:studio`               | Prisma Studio (ver e editar dados)        |

Antes de abrir um PR: `npm run format:check && npm run lint && npm run typecheck && npm test`.

## Estrutura

```
src/
  app/
    login/                 tela de login
    (painel)/              telas autenticadas: início, pratos, regras, semana, histórico
      semana/exportar/     rotas do .txt e da arte do dia
    imprimir/semana/       página de impressão A4
  lib/
    auth/                  sessão, senha e verificação de acesso
    gerador/               gerador do cardápio e análise das regras (funções puras, testadas)
    pratos/ regras/ semana/ exportacao/   validação e acesso a dados de cada módulo
  proxy.ts                 checagem otimista da sessão
prisma/
  schema.prisma            modelo de dados
  migrations/              migrações
  seed.ts                  dados iniciais
docs/                      planejamento, persona, análise e modelo de dados
```

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
