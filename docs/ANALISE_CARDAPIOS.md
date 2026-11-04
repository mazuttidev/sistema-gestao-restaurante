# Análise dos cardápios históricos

> Fonte: `Cardápios semanais.rar` (133 arquivos, 2019–2026), extraído em `referencias/cardapios/` e convertido para texto em `referencias/texto/`.
> Analisados 113 cardápios semanais (receitas e viandas excluídas), cerca de 980 dias de buffet.

## 1. Dias de funcionamento

| Dia     | Ocorrências                         |
| ------- | ----------------------------------- |
| Terça   | 142                                 |
| Quarta  | 160                                 |
| Quinta  | 161                                 |
| Sexta   | 158                                 |
| Sábado  | 153                                 |
| Domingo | 161                                 |
| Segunda | 45 (só em 6 arquivos; 0 desde 2023) |

**Conclusão:** o buffet funciona de **terça a domingo**. O documento do projeto fala em "segunda a sábado"; os cardápios reais mostram o contrário. O sistema deve ter **dias de funcionamento configuráveis**, com padrão terça–domingo. ⚠️ Confirmar com o gestor.

## 2. Estrutura do buffet

O formato da "folha da cozinha" (2019–2024 e parte de 2026) é sempre o mesmo:

```
Quinta
1) ... 9)      → 9 cubas numeradas do buffet
RICHÔS:
- ...          → 7 rechauds (às vezes 8)
Grelha: ...    → itens da grelha do dia
```

- **9 cubas** numeradas em 107 de 107 dias analisados de 2023; **7 rechauds** em 96 de 134 dias (6 a 9 no total).
- Total de **~16 posições por dia** (mediana de 15 itens).
- Números após o prato indicam **quantas cubas o item ocupa**: `arroz 2`, `pastel 2`, `farofa (1)`.
- `algo para eliminar` (265 ocorrências) = cuba reservada para **reaproveitar sobras**.
- Seção **Grelha** separada, com rodízio próprio: churrasco (452), queijo (355), bife de gado (322), hambúrguer (56), bife de frango (53), calabresa acebolada (34).
- Sobremesas aparecem em lista separada, sem dia definido.

Os arquivos de 2025 e parte de 2026 usam lista com marcadores (11–13 itens + Grelha) e notas de restrição como "(sem leite)", "(sem queijo)".

## 3. Pratos fixos e "posições fixas com variação"

Itens que aparecem praticamente todo dia:

| Posição      | Pratos                                                      | Observação                |
| ------------ | ----------------------------------------------------------- | ------------------------- |
| Arroz        | arroz branco (2 cubas), arroz integral (1)                  | fixo                      |
| Feijão       | feijão preto, carioca, vermelho, **feijoada**, **lentilha** | fixo, **varia a receita** |
| Farofa       | farofa caseira                                              | fixo                      |
| Batata frita | batata frita                                                | fixo, frito               |
| Pastel       | pastel de carne (2 cubas)                                   | fixo, frito               |
| Polenta      | frita, mole, brustolada, à milanesa, assada                 | fixo, **varia o preparo** |
| Grelha       | churrasco / bife / queijo / hambúrguer                      | estação separada          |

Frequentes, mas não diários: frango no espeto (284), queijo grelhado (197), parmegiana de gado (104), bife à milanesa (111), queijo à dorê (93), estrogonofe de carne (84), bolinho de bacalhau (81).

**Implicação para o modelo:** em vez de só "prato fixo", o sistema precisa de **posições (slots)** do buffet. Cada posição pode ser:

- **fixa** (sempre o mesmo prato, ex.: farofa caseira);
- **fixa com variação** (sempre existe, mas o prato roda entre opções, ex.: feijão → preto/carioca/feijoada/lentilha);
- **livre** (o gerador escolhe por categoria: massa, carne, frango, peixe, risoto, legume…);
- **sobras** (reservada para reaproveitamento, preenchida à mão).

## 4. Frituras

| Fritos por dia | Dias |
| -------------- | ---- |
| 0              | 13   |
| 1              | 35   |
| 2              | 112  |
| 3              | 465  |
| 4              | 235  |
| 5              | 100  |
| 6+             | 20   |

- Mediana de **3 fritos/dia**. Batata frita e pastel já contam 2 todos os dias.
- Dias com 5 ou mais fritos (12%) são o problema relatado pelo gestor ("até 7 frituras").
- **Sugestão de padrão:** limite de **4 fritos por dia**, contando os fixos. Configurável.
- Detecção usada: frita/frito, milanesa, à passarinho, empanado, pastel, bolinho, croquete, risoles, à dorê, à romana.

## 5. Formato do `.txt` diário (etiquetas)

Arquivo `caradapio 16-05-2026.txt`:

- UTF-8, quebras de linha **CRLF** (Windows);
- **um prato por linha**, sem cabeçalho, sem numeração, sem data;
- inclui itens da grelha e frios (salame, queijo) ao final;
- sem linha em branco no fim.

## 6. Repertório

- **1.221 nomes de pratos distintos** (com variações de grafia: "pastel 2", "pastel2", "pastel de carne"; "estrogonofe"/"strogonoff").
- A carga inicial (RF05) deve **normalizar nomes** e deixar o gestor revisar duplicados.
- Restrições alimentares aparecem nos nomes ("sem leite", "sem queijo", "sem lactose", "vegano") → sugerir um campo **restrições** no prato.

## 7. Respostas às pendências do planejamento

| Pendência               | Resposta (dos cardápios)                                                          | Confirmar com gestor?         |
| ----------------------- | --------------------------------------------------------------------------------- | ----------------------------- |
| Pratos fixos            | arroz, feijão (variado), farofa, batata frita, pastel de carne, polenta (variada) | Sim, a lista final            |
| Cubas por dia           | 9 cubas + 7 rechauds (~16 posições) + grelha                                      | Sim, se o sábado/domingo muda |
| Limite de fritos        | histórico mediano 3; sugerido 4                                                   | Sim, o número                 |
| Dias                    | terça a domingo                                                                   | **Sim, diverge do documento** |
| Formato do `.txt`       | um prato por linha, UTF-8, CRLF                                                   | Não                           |
| Janela de não repetição | não dá para inferir com segurança                                                 | Sim                           |
| Arte 1080×1920          | não está no arquivo                                                               | Sim, pedir o modelo do Canva  |
