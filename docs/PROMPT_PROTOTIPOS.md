# Prompt — Protótipos do Cardápio Certo

> Cole o bloco abaixo em uma ferramenta de prototipação com IA (Claude, v0, Lovable, Figma Make, Bolt etc.).
> Ele gera protótipos navegáveis de alta fidelidade, com dados fictícios e sem backend.
> Base: `docs/PLANEJAMENTO.md` e `docs/PERSONA.md`.

---

```text
Você é um designer de produto sênior e desenvolvedor front-end. Crie um PROTÓTIPO NAVEGÁVEL DE ALTA FIDELIDADE
de um painel web chamado "Cardápio Certo", feito para o Restaurante Botafogo, um restaurante de buffet em
Bento Gonçalves (RS). Toda a interface deve estar em português do Brasil.

=====================================================================
1. CONTEXTO
=====================================================================
Hoje o gestor monta o cardápio da semana à mão no Word (~2 horas por semana, consultando cardápios antigos).
Quando não tem tempo, não monta, a compra de insumos atrasa e a cozinha improvisa (já saíram 7 frituras no
mesmo dia). Todo dia ele também copia o cardápio do Excel para um .txt (etiquetas do buffet) e para um modelo
no Canva (story 1080x1920 para Instagram, Facebook, site e grupo de WhatsApp).

O sistema deve: cadastrar pratos, configurar regras, GERAR a semana (terça a domingo) automaticamente,
permitir ajuste manual, HOMOLOGAR e EXPORTAR (impressão semanal, .txt diário e arte 1080x1920).
Meta: gerar e homologar a semana em menos de 10 minutos.

=====================================================================
2. PERSONA
=====================================================================
Principal: Carlos, 48 anos, administrador do restaurante. Muito ocupado, usa celular o dia todo
(WhatsApp, Instagram) e notebook para Word/Excel/Canva sem domínio avançado. Quer "um clique e pronto",
ver de relance se o dia está equilibrado e trocar um prato sem quebrar o resto.
Secundária: Dona Neusa, cozinheira-chefe. Só recebe a folha impressa da semana; precisa de letra grande
e organização por dia e por cuba.

Implicações de design: linguagem simples (nada de jargão técnico), botões grandes, poucas decisões por tela,
estado das regras sempre visível, funcionar bem no celular.

=====================================================================
3. REGRAS DE NEGÓCIO (devem aparecer refletidas na interface)
=====================================================================
- RN01 Cardápio de TERÇA a DOMINGO (6 dias; segunda o restaurante fecha). Dias configuráveis.
- RN02 O buffet tem uma ESTRUTURA DE POSIÇÕES por dia: 9 CUBAS numeradas + 7 RECHAUDS ("Richôs") + a GRELHA.
  Cada posição é de um destes tipos:
    · FIXA: sempre o mesmo prato (ex.: Farofa caseira, Batata frita, Pastel de carne).
    · FIXA COM VARIAÇÃO: sempre existe, mas o prato roda (ex.: Feijão → preto / carioca / vermelho / feijoada / lentilha;
      Polenta → frita / mole / brustolada / à milanesa).
    · LIVRE: o gerador escolhe um prato da categoria (massa, carne, frango, peixe, suíno, risoto, legume, queijo).
    · SOBRAS: reservada para reaproveitamento, preenchida à mão ("algo para eliminar").
- RN03 Categoria do prato: Arroz, Feijão, Massa, Carne, Frango, Peixe, Suíno, Risoto, Polenta, Legume/Salada,
  Salgado/Frito, Queijo, Grelha. Um prato pode ocupar 2 cubas (ex.: "Arroz branco ×2", "Pastel de carne ×2").
- RN04 Método de preparo: Forno, Grelha/Espeto, Fritadeira, Panela, Nenhum.
- RN05 Equilibrar forno, grelha e fritadeira em cada dia.
- RN06 Limite de itens FRITOS por dia, configurável (padrão 4, contando batata frita e pastel, que são fixos).
- RN07 Número de cubas/rechauds pode variar por dia.
- RN08 Não repetir pratos em dias consecutivos nem em relação à semana anterior.
- RN11 A GRELHA tem rodízio próprio: Churrasco (sáb/dom), Bife de gado, Queijo, Hambúrguer, Bife de frango, Calabresa acebolada.
- RN09 O gestor pode ajustar manualmente qualquer item.
- RN10 Só o cardápio HOMOLOGADO pode ser exportado.

=====================================================================
4. IDENTIDADE VISUAL
=====================================================================
- Clima: cozinha caseira gaúcha, acolhedor e confiável, mas um painel limpo e funcional (não um site de marketing).
- Paleta sugerida (ajustável ao logo do restaurante):
  - Primária: verde-oliva/verde-folha (ação principal, "dia ok")
  - Secundária: terracota/tomate (destaques, marca)
  - Neutros quentes: off-white #FAF7F2 de fundo, cinza-quente para textos secundários
  - Estados: verde = regras ok, âmbar = atenção, vermelho = regra violada
- Cores por método de preparo (badges), sempre com ícone + texto, nunca só cor:
  Forno (laranja, ícone de forno), Grelha (marrom, ícone de grelha), Fritadeira (amarelo-mostarda, ícone de gota de óleo),
  Nenhum (cinza).
- Tipografia: sans-serif muito legível (ex.: Inter, Nunito Sans ou Source Sans). Corpo ≥ 16 px.
- Cantos levemente arredondados, sombras suaves, bastante respiro.
- Acessibilidade: contraste WCAG AA, foco visível, alvos de toque ≥ 44 px.

=====================================================================
5. ESTRUTURA E NAVEGAÇÃO
=====================================================================
Desktop: barra lateral esquerda com logo "Cardápio Certo · Restaurante Botafogo" e itens:
  Início · Semana · Pratos · Regras · Histórico · (rodapé) Conta / Sair
Celular (360–430 px): barra inferior com Início, Semana, Pratos, Mais (Regras, Histórico, Conta).

=====================================================================
6. TELAS (crie TODAS, navegáveis entre si)
=====================================================================

T1. LOGIN
- Logo, título "Cardápio Certo", campos e-mail e senha, botão "Entrar", link "Esqueci minha senha".
- Estado de erro: "E-mail ou senha incorretos".

T2. INÍCIO (painel)
- Saudação "Bom dia, Carlos".
- Card de destaque "Cardápio de HOJE" (ex.: terça, 17/11) com a lista de pratos e três ações rápidas:
  "Baixar .txt", "Baixar arte", "Copiar para WhatsApp".
- Card "Próxima semana (24/11 a 29/11)": estado "Não gerado" com botão grande "Gerar semana",
  ou "Rascunho" com "Continuar ajuste", ou "Homologado" com "Imprimir para a cozinha".
- Indicadores pequenos: pratos ativos (ex.: 86), última homologação, fritos médios por dia na semana atual.

T3. SEMANA (tela principal; a mais importante)
- Cabeçalho: seletor de semana (‹ 17/11 a 22/11 ›), badge de status (Rascunho / Homologado),
  botões "Gerar semana" (ou "Regenerar"), "Desfazer", e botão primário "Homologar".
- Desktop: grade de 6 colunas (Ter a Dom). Cada coluna:
  - Cabeçalho do dia com data e um RESUMO DE REGRAS:
    "Fritos 3/4 ✓", "Posições 16/16 ✓", "Fixos ✓", "Sem repetição ✓".
    Fundo/ícone verde quando tudo ok; âmbar ou vermelho com o motivo escrito quando não.
  - Três blocos, na ordem física do buffet:
    · "Cubas" (1 a 9, numeradas);
    · "Rechauds" (7 posições);
    · "Grelha" (1–2 itens).
    Cada item com: número da posição, nome, badge de preparo, selo "×2" quando ocupa 2 cubas,
    marcador do tipo de posição (fixa = alfinete, variável = setas circulares, sobras = pote),
    ícone de cadeado (travar/destravar) e menu "Trocar prato" / "Remover".
  - Rodapé do dia: "Regenerar este dia".
- Celular: abas ou carrossel por dia (Ter, Qua, ...) com o mesmo conteúdo em lista.
- Interação "Trocar prato": painel lateral (desktop) ou bottom sheet (celular) com busca e lista de pratos da
  mesma categoria da posição; primeiro as sugestões que respeitam todas as regras, depois as que violam alguma, com o motivo
  (ex.: "Excede o limite de fritos", "Servido na semana passada").
- Aviso ao violar regra: toast/alerta não bloqueante "Quarta ficou com 5 fritos (limite 4). Manter assim?"
  com "Manter" e "Desfazer".
- Modal "Homologar semana": resumo da semana, lista de alertas aceitos, texto
  "Após homologar, este cardápio vira a lista oficial da cozinha", botões "Cancelar" e "Homologar".
- Estado homologado: grade somente leitura, faixa verde "Homologado em 13/11 às 16:42",
  ações "Imprimir semana", "Exportações do dia", "Reabrir para edição".
- Estados extras: semana vazia (ilustração + "Gerar semana"), gerando (skeleton/loading),
  aviso de repertório insuficiente ("Não há proteínas suficientes sem repetir; 1 repetição foi permitida na quinta").

T4. PRATOS (lista)
- Busca por nome; filtros (chips) por Tipo, Preparo e Ativo/Inativo; botão "Novo prato".
- Desktop: tabela (Nome, Tipo, Preparo, Ativo, Última vez servido, ações).
- Celular: cards.
- Estado vazio com botão "Importar planilha".

T5. PRATO (formulário, em modal ou página)
- Campos: Nome*, Categoria* (select: Arroz, Feijão, Massa, Carne, Frango, Peixe, Suíno, Risoto, Polenta,
  Legume/Salada, Salgado/Frito, Queijo, Grelha),
  Preparo* (segmented control com ícones: Forno / Grelha / Fritadeira / Panela / Nenhum),
  Ocupa (1 cuba / 2 cubas), Restrições (chips: Sem lactose, Sem glúten, Vegano, Vegetariano), Ativo (switch),
  Observação (opcional, ex.: "Depende do fornecedor de peixe-rei").
- Validação: "Já existe um prato com esse nome".
- Excluir: confirmação; se o prato já foi usado, oferecer "Desativar" em vez de excluir.

T6. IMPORTAR PRATOS
- Upload de planilha (CSV/Excel), pré-visualização em tabela com linhas válidas/inválidas/duplicadas,
  botão "Importar 72 pratos".

T7. REGRAS E ESTRUTURA DO BUFFET
- Seção "Dias de funcionamento": 7 chips (Seg a Dom), marcados de Ter a Dom.
- Seção "Estrutura do buffet" (a mais importante): editor visual das posições, imitando o balcão:
  uma fileira "Cubas 1–9", uma fileira "Rechauds 1–7" e "Grelha". Cada posição é um card editável com:
  tipo (Fixa / Fixa com variação / Livre / Sobras), categoria, e
    · se Fixa: o prato (ex.: Farofa caseira);
    · se Fixa com variação: a lista de pratos que se alternam (ex.: Feijão preto, Feijão carioca, Feijoada, Lentilha);
    · se Livre: a categoria (ex.: Massa).
  Arrastar para reordenar. Opção "esta posição só em: Sáb, Dom".
- Seção "Fritos": stepper "Máximo de fritos por dia" (padrão 4), com nota "batata frita e pastel contam".
- Seção "Repetição": "Não repetir pratos servidos nas últimas [1] semana(s)" + checkbox
  "Não repetir em dias seguidos".
- Seção "Grelha": rodízio por dia (ex.: Sáb e Dom = Churrasco; Ter = Bife de gado + Queijo).
- Validação em tempo real: "A posição 'Peixe' não tem pratos ativos suficientes para 6 dias sem repetir".
- Botão "Salvar regras" e texto explicativo curto em cada seção, em linguagem simples.

T8. HISTÓRICO
- Lista de semanas (período, status, data de homologação), busca por prato ("Quando servi peixe-rei?").
- Abrir semana em modo leitura; ação "Usar como base".

T9. EXPORTAÇÕES DO DIA (modal ou página a partir da Semana/Início)
- Seletor de dia.
- Três cards: "Etiquetas (.txt)" com pré-visualização do texto em fonte monoespaçada (um prato por linha,
  sem numeração nem cabeçalho, como o arquivo atual) e botão "Baixar .txt";
  "Arte para redes (1080x1920)" com miniatura e botões "Baixar PNG" e "Compartilhar";
  "Texto para WhatsApp" com pré-visualização e "Copiar".
- Desabilitado com explicação quando a semana não está homologada.

T10. IMPRESSÃO SEMANAL (pré-visualização A4)
- Página A4 paisagem, sem cores decorativas: título "Cardápio da semana · 17/11 a 22/11",
  6 blocos (Ter a Dom), cada um no formato que a cozinha já usa:
  "1) ... 9)" para as cubas, "RICHÔS:" com 7 linhas, e "Grelha: ...". Letra grande, "×2" quando ocupa 2 cubas.
- Rodapé: "Homologado em 13/11/2026". Botões "Imprimir" e "Baixar PDF".

T11. ARTE 1080x1920 (o próprio template, em tamanho real reduzido)
- Formato story vertical: logo do restaurante no topo, título "Cardápio de hoje", data por extenso
  ("Terça-feira, 17 de novembro"), lista de pratos agrupada (Pratos do dia / Acompanhamentos / Na grelha),
  rodapé com endereço/Instagram/WhatsApp fictícios.
- Visual apetitoso: fundo com textura leve ou cor da marca, tipografia display para o título.
- Deve caber até 20 pratos sem cortar (fonte reduz automaticamente).

T12. CONTA
- Nome, e-mail, alterar senha, botão "Sair".

=====================================================================
7. DADOS DE EXEMPLO (pratos reais dos cardápios do restaurante; use para preencher as telas)
=====================================================================
Estrutura padrão do dia:
  Cubas: 1) Arroz branco ×2 [fixa]  2) Feijão [variável]  3) Massa [livre]  4) Carne [livre]  5) Peixe [livre]
         6) Frango [livre]  7) Batata frita [fixa]  8) Pastel de carne ×2 [fixa]  9) Queijo/Salgado [livre]
  Rechauds: Risoto [livre], Polenta [variável], Legume [livre], Suíno [livre], Arroz integral [fixa],
            Sobras [sobras], Farofa caseira [fixa]
  Grelha: rodízio
Pratos por categoria:
  Feijão: Feijão preto, Feijão carioca, Feijão vermelho, Feijoada, Lentilha.
  Polenta: Polenta frita (Fritadeira), Polenta mole, Polenta brustolada (Grelha), Polenta à milanesa (Fritadeira).
  Massa: Massa ao molho italiano, Espaguete ao molho napolitano, Nhoque ao molho de frango, Lasanha de frango (Forno),
    Tortéi al pesto, Panqueca de guisado (Forno), Ravioli ao molho pomodoro, Canelone de ricota (Forno).
  Carne: Carne ao molho ferrugem, Estrogonofe de carne, Parmegiana de gado (Forno), Bife de gado à milanesa (Fritadeira),
    Escalopes ao molho de cerveja, Vaca atolada, Cupim assado (Forno), Maminha assada (Forno).
  Frango: Frango no espeto (Grelha), Parmegiana de frango (Forno), Coxa grelhada na churrasqueira (Grelha),
    Frango à passarinho (Fritadeira), Frango ao molho.
  Peixe: Tilápia grelhada (Grelha), Tilápia frita (Fritadeira), Anchova grelhada com alcaparras (Grelha),
    Salmão grelhado (Grelha), Filé de pescada empanado (Fritadeira), Peixe-rei frito (Fritadeira).
  Suíno: Costela suína acebolada (Forno), Costela suína no espeto ao alho e óleo (Grelha), Pernil assado (Forno).
  Risoto: Risoto de funghi, Risoto de alho-poró, Risoto de tomate seco e rúcula.
  Legume: Couve refogada, Moranga refogada, Purê de batata, Aipim a vapor, Espinafre com ovos, Torta de espinafre (Forno).
  Salgado/Queijo: Queijo grelhado (Grelha), Queijo à dorê (Fritadeira), Bolinho de bacalhau (Fritadeira), Fortaia.
  Grelha: Churrasco, Bife de gado, Queijo, Hambúrguer, Bife de frango, Calabresa acebolada.
Regras de exemplo: Ter a Dom; máximo 4 fritos/dia; não repetir na semana anterior nem em dias seguidos;
  grelha Sáb/Dom = Churrasco.
Semana de exemplo: 17/11/2026 (terça) a 22/11/2026 (domingo), em rascunho, com QUARTA em âmbar
  (5 fritos após troca manual) e os demais dias em verde.

=====================================================================
8. REQUISITOS DO PROTÓTIPO
=====================================================================
- Navegável: todos os botões e itens de menu levam à tela correspondente; estados principais simuláveis
  (gerar semana, trocar prato, travar item, alerta de regra, homologar, exportar).
- Mostrar versões DESKTOP (1440 px) e CELULAR (390 px) das telas T2, T3, T4, T7 e T9.
- Dados fictícios em memória; sem backend, sem login real.
- Componentes consistentes (botões, badges de preparo, chips, cards, tabela, modal, bottom sheet, toast).
- Microtextos em português claro e direto, no tom de quem fala com o dono de um restaurante.
- Nunca usar só cor para comunicar estado: sempre ícone + texto.

=====================================================================
9. ENTREGÁVEIS
=====================================================================
1. Protótipo navegável com as 12 telas acima.
2. Uma página "Guia de estilo" com paleta, tipografia, badges de preparo e estados de regra.
3. Um fluxo principal destacado (happy path) para a demo ao gestor:
   Início → Gerar semana → Trocar prato na terça → ver alerta → Desfazer → Homologar
   → Imprimir semana → Exportações do dia → Baixar arte.
4. Lista curta de decisões de design e dúvidas para validar com o gestor.
```

---

## Dicas de uso

- **Ferramenta de IA que gera código (Claude, v0, Lovable, Bolt):** acrescente ao final: "Implemente em React + Tailwind,
  um único app com roteamento simples e estado em memória."
- **Figma Make / ferramenta de design:** acrescente: "Organize em páginas: Guia de estilo, Desktop, Celular, Fluxo principal."
- Se o resultado ficar grande demais, gere em partes: (1) guia de estilo + T1–T3, (2) T4–T8, (3) T9–T12.
- Antes de validar com o gestor, troque a paleta e o logo pelos do restaurante e use os pratos reais.
