# Planejamento — Cardápio Certo (Restaurante Botafogo)

> Painel web para gestão e geração automatizada de cardápios semanais do Restaurante Botafogo.
> Projeto de extensão IFRS Campus Bento Gonçalves · Projeto Extensionista III (ADS) · 29/09/2026 a 09/12/2026 · 65 h.
> Fonte: `Projeto de Extensão - Restaurante Botafogo.docx.md`.

## 1. Contexto e problema

O Restaurante Botafogo (Bento Gonçalves/RS) serve buffet a clientes locais, grupos e turistas. Hoje:

| Processo atual                                                                                                                                              | Problema                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Cardápio semanal montado à mão no Word, consultando cardápios antigos, impresso e entregue à cozinha                                                        | ~2 h por semana; muitas vezes não é feito por falta de tempo            |
| Sem cardápio planejado, a compra de insumos (ex.: peixe-rei) não é antecipada                                                                               | Compras de última hora, desperdício, cozinha improvisa                  |
| Cozinha improvisa os pratos                                                                                                                                 | Desequilíbrio: até 7 itens fritos no mesmo dia, excesso de carboidratos |
| Cardápio diário: planilha Excel → exporta `.txt` (etiquetas do buffet) → cola no modelo do Canva → publica no site, Facebook, Instagram e grupo de clientes | Retrabalho manual todos os dias                                         |

## 2. Objetivos

**Geral:** desenvolver e implantar um painel web que gere o cardápio semanal automaticamente, garanta o equilíbrio das refeições e padronize a divulgação diária.

**Específicos:**

1. Levantar e documentar requisitos e regras de negócio com o gestor.
2. Cadastrar e categorizar pratos por tipo e por método de preparo.
3. Gerar automaticamente o cardápio da semana (dias de funcionamento, padrão terça a domingo) respeitando as regras.
4. Permitir ajuste manual e homologação pelo gestor.
5. Exportar: cardápio semanal para impressão, cardápio diário em `.txt` e arte 1080×1920 px.
6. Implantar em produção e avaliar usabilidade e impacto.

## 3. Escopo

### 3.1 Módulos

| #   | Módulo           | Conteúdo                                                                                              |
| --- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| M0  | Base             | Autenticação do gestor, layout do painel, infraestrutura                                              |
| M1  | Pratos           | Cadastro, categorização (tipo + método de preparo), ativação/inativação, busca e filtros              |
| M2  | Regras e geração | Configuração de regras, gerador automático da semana (ter–dom), ajuste manual, homologação, histórico |
| M3  | Exportações      | Impressão semanal (A4), `.txt` diário, arte 1080×1920 px, texto para mensagens                        |

### 3.2 Regras de negócio (documento + análise dos cardápios)

> Ajustadas com base em `docs/ANALISE_CARDAPIOS.md` (113 cardápios reais, 2019–2026).

| ID   | Regra                                                                                                                                                                                                                        |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN01 | O cardápio cobre os **dias de funcionamento**, configuráveis. Padrão: **terça a domingo** (6 dias), conforme os cardápios reais. O documento cita segunda a sábado: confirmar com o gestor.                                  |
| RN02 | O dia segue uma **estrutura de posições**: 9 cubas + 7 rechauds + grelha. Cada posição é **fixa** (ex.: farofa), **fixa com variação** (ex.: feijão preto/carioca/feijoada/lentilha), **livre por categoria** ou **sobras**. |
| RN03 | Cada prato tem **categoria** (arroz, feijão, massa, carne, frango, peixe, suíno, risoto, polenta, legume/salada, frito/salgado, queijo, grelha) e pode ocupar **mais de uma cuba** (ex.: arroz 2, pastel 2).                 |
| RN04 | Cada prato tem **método de preparo**: forno, grelha/espeto, fritadeira, panela/fogão, nenhum.                                                                                                                                |
| RN05 | O dia deve **equilibrar** forno, grelha e fritadeira.                                                                                                                                                                        |
| RN06 | Há um **limite de itens fritos por dia** (contando os fixos), configurável. Padrão sugerido: 4 (histórico: mediana 3).                                                                                                       |
| RN07 | O **número de cubas e rechauds** pode variar por dia.                                                                                                                                                                        |
| RN11 | A **grelha** tem rodízio próprio (churrasco, bife de gado, queijo, hambúrguer, bife de frango…).                                                                                                                             |
| RN08 | **Não repetir** pratos em dias consecutivos nem em relação à semana anterior.                                                                                                                                                |
| RN09 | O gestor pode **ajustar manualmente** qualquer item do cardápio gerado.                                                                                                                                                      |
| RN10 | Só o cardápio **homologado** é exportado e vira a lista oficial da cozinha.                                                                                                                                                  |

### 3.3 Requisitos funcionais

| ID   | Requisito                                                                                                  | Módulo | Prioridade |
| ---- | ---------------------------------------------------------------------------------------------------------- | ------ | ---------- |
| RF01 | Login do gestor                                                                                            | M0     | Must       |
| RF02 | CRUD de pratos                                                                                             | M1     | Must       |
| RF03 | Classificar prato por tipo e método de preparo                                                             | M1     | Must       |
| RF04 | Ativar/inativar prato e buscar/filtrar a lista                                                             | M1     | Should     |
| RF05 | Importar pratos de cardápios antigos (carga inicial)                                                       | M1     | Could      |
| RF06 | Configurar regras e estrutura do buffet (posições, fixos, limite de fritos, dias, janela de não repetição) | M2     | Must       |
| RF07 | Gerar cardápio semanal automaticamente                                                                     | M2     | Must       |
| RF08 | Exibir a semana em grade, com indicadores de regra por dia                                                 | M2     | Must       |
| RF09 | Trocar prato manualmente, regenerar um dia, travar itens                                                   | M2     | Must       |
| RF10 | Alertar quando um ajuste manual viola uma regra                                                            | M2     | Should     |
| RF11 | Homologar o cardápio da semana                                                                             | M2     | Must       |
| RF12 | Consultar histórico de cardápios                                                                           | M2     | Should     |
| RF13 | Exportar cardápio semanal para impressão (A4/PDF)                                                          | M3     | Must       |
| RF14 | Exportar cardápio diário em `.txt` (etiquetas)                                                             | M3     | Must       |
| RF15 | Gerar arte do dia em 1080×1920 px (PNG)                                                                    | M3     | Must       |
| RF16 | Copiar texto do dia para WhatsApp/redes                                                                    | M3     | Could      |

### 3.4 Requisitos não funcionais

| ID    | Requisito                                                                |
| ----- | ------------------------------------------------------------------------ |
| RNF01 | Gerar e homologar a semana em **menos de 10 minutos** (meta do projeto). |
| RNF02 | Interface em português, simples, usável por alguém sem formação técnica. |
| RNF03 | Responsivo (desktop e celular).                                          |
| RNF04 | Geração do cardápio em menos de 3 s.                                     |
| RNF05 | Conformidade com a LGPD: dados mínimos, senhas com hash, HTTPS.          |
| RNF06 | Código versionado em Git com branches e pull requests.                   |
| RNF07 | Sistema hospedado e acessível ao parceiro pela internet.                 |
| RNF08 | Backup diário do banco de dados.                                         |

### 3.5 Fora do escopo

Controle de estoque e compras, ficha técnica/nutricional por prato, publicação automática nas redes sociais via API, múltiplos restaurantes.

## 4. Stack (decidida em 04/11/2026)

Backend em **Node.js com TypeScript** (route handlers e server actions do Next.js rodando no runtime Node), frontend em Next.js:

| Camada         | Escolha                                            | Motivo                                           |
| -------------- | -------------------------------------------------- | ------------------------------------------------ |
| Front + back   | Next.js (App Router) + TypeScript, backend Node.js | Um só repositório e deploy                       |
| UI             | Tailwind CSS + shadcn/ui                           | Componentes acessíveis e rápidos de montar       |
| Banco          | PostgreSQL + Prisma                                | Modelo relacional simples, migrações versionadas |
| Auth           | Auth.js (credenciais)                              | Um usuário gestor, sem dependência externa       |
| Arte 1080×1920 | `@vercel/og` (Satori) ou canvas no servidor        | PNG gerado a partir de template                  |
| Impressão      | Página com CSS `@media print` / PDF                | Sem dependência pesada                           |
| Testes         | Vitest (gerador) + Playwright (E2E)                | O gerador é a parte crítica                      |
| Hospedagem     | Vercel + Neon/Supabase (Postgres)                  | Plano gratuito suficiente                        |

### 4.1 Modelo de dados inicial

- **Prato**: id, nome, categoria, metodo_preparo (forno | grelha | fritadeira | panela | nenhum), frito (derivado do preparo), cubas (1 ou 2), restricoes[] (sem lactose, sem glúten, vegano…), ativo, observação.
- **Posição** (estrutura do buffet): id, area (cuba | rechaud | grelha), ordem, tipo (fixa | variavel | livre | sobras), categoria, pratos_permitidos[], dias[].
- **Regra** (configuração única): dias_funcionamento[], max_fritos_dia, janela_nao_repeticao_semanas, nao_repetir_dias_seguidos.
- **Cardápio**: id, semana_inicio, status (rascunho | homologado), criado_em, homologado_em.
- **ItemCardapio**: cardapio_id, data, posicao_id, prato_id, travado.
- **Usuário**: id, nome, email, senha_hash.

### 4.2 Algoritmo do gerador (esboço)

1. Para cada dia de funcionamento, preencher as posições fixas e escolher a variação das posições "fixa com variação" (RN02).
2. Para cada posição livre, montar candidatos da categoria da posição (RN03, RN07).
3. Montar candidatos por tipo, excluindo os usados no dia anterior e na semana anterior (RN08).
4. Sortear com peso, respeitando o limite de fritos (RN06) e distribuindo forno/grelha/fritadeira (RN05).
5. Se faltar candidato, relaxar a não repetição de forma controlada e sinalizar o dia.
6. Itens travados pelo gestor nunca são substituídos ao regenerar.

## 5. Cronograma

| Sprint | Período       | Atividade (documento)                           | Entregas                                                     |
| ------ | ------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| S1     | 29/09 – 12/10 | Levantamento de requisitos (10 h)               | Entrevistas, documento de requisitos                         |
| S2     | 13/10 – 26/10 | Prototipação (10 h) + início do desenvolvimento | Personas, histórias, protótipo validado, modelagem, setup    |
| S3     | 27/10 – 09/11 | Desenvolvimento (25 h)                          | M0, M1, M2 (gerador)                                         |
| S4     | 10/11 – 23/11 | Testes e hospedagem (10 h)                      | M2 (ajuste/homologação), M3, testes, deploy                  |
| S5     | 24/11 – 09/12 | Avaliação (5 h) + relatório final (5 h)         | Orientação de uso, questionário, medição de tempo, relatório |

Entregas no AVEA/Moodle: Fase 1 (requisitos, protótipo, código inicial) e Fase 2 (URL do sistema, relatório final).

## 6. Equipe

| Pessoa                     | Papel                      |
| -------------------------- | -------------------------- |
| Luan Lazzari               | Coordenador (docente)      |
| Bernardo Faccini Marquetti | Discente — desenvolvimento |
| Gedean Zitkoski            | Discente — desenvolvimento |
| Gustavo de Carli           | Discente — desenvolvimento |
| Jean Carlo de Toni         | Discente — desenvolvimento |
| Victor Mazutti             | Discente — desenvolvimento |

A divisão de responsabilidades por pessoa fica a cargo da equipe no quadro do Notion.

## 7. Indicadores de sucesso

| Indicador                                    | Meta                                                          |
| -------------------------------------------- | ------------------------------------------------------------- |
| Tempo para gerar e homologar a semana        | de ~2 h para < 10 min                                         |
| Pratos fixos presentes nos cardápios gerados | 100%                                                          |
| Dias dentro do limite de fritos              | 100%                                                          |
| Satisfação/usabilidade (CSAT/NPS, Likert)    | ≥ 80% de aprovação                                            |
| Requisitos entregues e testados              | ≥ 80%                                                         |
| Frequência da equipe                         | ≥ 75%                                                         |
| Uso efetivo                                  | Cardápio homologado no sistema toda semana após a implantação |

## 8. Riscos

| Risco                                                             | Mitigação                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Regras ainda vagas (quantas cubas, quais fixos, limite de fritos) | Validar números com o gestor na S2; deixar tudo configurável                    |
| Poucos pratos cadastrados → gerador sem opções                    | Carga inicial a partir dos cardápios antigos; relaxamento controlado das regras |
| Prazo curto (10 semanas, 65 h)                                    | MVP = M1 + gerador + homologação + `.txt`; arte e impressão em seguida          |
| Gestor sem tempo para validar                                     | Demos curtas (15 min) ao fim de cada sprint                                     |
| Custo de hospedagem após o projeto                                | Planos gratuitos; documentar a manutenção                                       |

## 9. Pendências

Respondidas pelos cardápios históricos (detalhes em `docs/ANALISE_CARDAPIOS.md`):

| Pendência         | Resposta                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Pratos fixos      | arroz (branco 2 cubas + integral), feijão (variado), farofa caseira, batata frita, pastel de carne (2 cubas), polenta (variada) |
| Cubas por dia     | 9 cubas + 7 rechauds + grelha                                                                                                   |
| Limite de fritos  | histórico mediano 3/dia; padrão sugerido 4                                                                                      |
| Dias              | terça a domingo                                                                                                                 |
| Formato do `.txt` | um prato por linha, UTF-8, CRLF, sem cabeçalho                                                                                  |

Ainda para validar com o gestor:

- Confirmar **terça a domingo** (o documento diz segunda a sábado).
- Confirmar lista de fixos e limite de 4 fritos.
- Janela de não repetição (só a semana anterior ou mais?).
- Modelo atual do Canva (cores, logo, fontes) para a arte 1080×1920.
- Quem mais acessa o painel (só o gestor ou também a cozinha?).
