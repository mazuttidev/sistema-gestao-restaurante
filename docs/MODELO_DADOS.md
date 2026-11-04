# Modelo de dados

Fonte da verdade: `prisma/schema.prisma`. Regras de negócio em `docs/PLANEJAMENTO.md` §3.2.

```mermaid
erDiagram
  Prato ||--o{ PosicaoOpcao : "é opção de"
  Posicao ||--o{ PosicaoOpcao : "aceita"
  Cardapio ||--|{ ItemCardapio : "contém"
  Posicao ||--o{ ItemCardapio : "preenchida por"
  Prato |o--o{ ItemCardapio : "servido em"

  Prato {
    string id PK
    string nome
    string nomeNormalizado UK
    Categoria categoria
    MetodoPreparo preparo
    int cubas
    Restricao[] restricoes
    bool ativo
  }
  Posicao {
    string id PK
    Area area
    int ordem
    string nome
    TipoPosicao tipo
    Categoria categoria
    int[] dias
    bool ativa
  }
  PosicaoOpcao {
    string posicaoId PK
    string pratoId PK
  }
  Cardapio {
    string id PK
    date semanaInicio UK
    StatusCardapio status
    datetime homologadoEm
  }
  ItemCardapio {
    string id PK
    string cardapioId FK
    date data
    string posicaoId FK
    string pratoId FK
    bool travado
  }
  Configuracao {
    int id PK
    int[] diasFuncionamento
    int maxFritosDia
    int semanasSemRepetir
    bool naoRepetirDiasSeguidos
  }
  Usuario {
    string id PK
    string email UK
    string senhaHash
  }
```

## Decisões

| Decisão                                                 | Motivo                                                                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Posição** como entidade própria (área + ordem + tipo) | O buffet real tem 9 cubas + 7 rechauds + grelha; o gestor pensa em "o que vai na cuba 2", não em "pratos fixos" soltos (RN02). |
| `TipoPosicao` = FIXA, VARIAVEL, LIVRE, SOBRAS           | Cobre arroz/farofa (fixa), feijão/polenta (variável), massa/carne (livre) e a cuba de reaproveitamento (sobras).               |
| Opções de posição em tabela N:N (`PosicaoOpcao`)        | FIXA tem 1 opção, VARIAVEL tem várias; LIVRE usa a categoria.                                                                  |
| `Posicao.dias` vazio = todos os dias                    | Permite posições só de fim de semana (ex.: churrasco sáb/dom).                                                                 |
| Frito = `preparo == FRITADEIRA`                         | Evita campo redundante; o limite de fritos (RN06) conta esses pratos.                                                          |
| `Prato.cubas`                                           | Arroz branco e pastel ocupam 2 cubas na prática.                                                                               |
| `nomeNormalizado` único                                 | Evita duplicados por acento/caixa ("Queijo à Dorê" = "queijo a dore"), essencial na importação dos 1.221 nomes históricos.     |
| `ItemCardapio.pratoId` opcional                         | Posição de sobras fica vazia até o gestor preencher.                                                                           |
| `onDelete: Restrict` em Prato/Posição usados            | Preserva o histórico; pratos e posições são desativados, não apagados.                                                         |
| `Configuracao` com registro único (id = 1)              | Um restaurante só (multi-restaurante está fora do escopo).                                                                     |
| Dias como inteiros 0–6 (0 = domingo)                    | Mesmo padrão do `Date.getDay()` do JavaScript.                                                                                 |
