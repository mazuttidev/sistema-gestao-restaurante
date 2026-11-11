// Cenário de testes do gerador: um buffet reduzido, parecido com o real (prisma/seed.ts).
import type { Categoria, MetodoPreparo } from "@/generated/prisma/enums";
import type { PosicaoGerador, PratoGerador, RegrasGerador } from "../tipos";

export const SEMANA = "2026-11-10"; // terça
export const DIAS = [
  "2026-11-10",
  "2026-11-11",
  "2026-11-12",
  "2026-11-13",
  "2026-11-14",
  "2026-11-15",
];

export const REGRAS: RegrasGerador = {
  diasFuncionamento: [2, 3, 4, 5, 6, 0],
  maxFritosDia: 4,
  semanasSemRepetir: 1,
  naoRepetirDiasSeguidos: true,
};

function prato(
  id: string,
  categoria: Categoria,
  preparo: MetodoPreparo,
  ativo = true,
): PratoGerador {
  return { id, nome: id, categoria, preparo, ativo };
}

export const PRATOS: PratoGerador[] = [
  prato("arroz", "ARROZ", "PANELA"),
  prato("feijao-preto", "FEIJAO", "PANELA"),
  prato("feijao-carioca", "FEIJAO", "PANELA"),
  prato("lentilha", "FEIJAO", "PANELA"),
  prato("batata-frita", "SALGADO", "FRITADEIRA"),
  prato("pastel", "SALGADO", "FRITADEIRA"),
  prato("churrasco", "GRELHA", "GRELHA"),
  ...Array.from({ length: 14 }, (_, i) =>
    prato(`carne-${i + 1}`, "CARNE", (["FORNO", "PANELA", "FRITADEIRA"] as const)[i % 3]),
  ),
  ...Array.from({ length: 14 }, (_, i) =>
    prato(`peixe-${i + 1}`, "PEIXE", (["GRELHA", "FRITADEIRA", "FORNO"] as const)[i % 3]),
  ),
  ...Array.from({ length: 14 }, (_, i) =>
    prato(`massa-${i + 1}`, "MASSA", i % 2 ? "FORNO" : "PANELA"),
  ),
  prato("massa-inativa", "MASSA", "PANELA", false),
];

function posicao(
  id: string,
  ordem: number,
  tipo: PosicaoGerador["tipo"],
  extra: Partial<PosicaoGerador> = {},
): PosicaoGerador {
  return {
    id,
    area: "CUBA",
    ordem,
    nome: id,
    tipo,
    categoria: null,
    dias: [],
    ativa: true,
    opcoes: [],
    ...extra,
  };
}

export const POSICOES: PosicaoGerador[] = [
  posicao("arroz", 1, "FIXA", { opcoes: ["arroz"] }),
  posicao("feijao", 2, "VARIAVEL", {
    opcoes: ["feijao-preto", "feijao-carioca", "lentilha"],
  }),
  posicao("massa", 3, "LIVRE", { categoria: "MASSA" }),
  posicao("carne", 4, "LIVRE", { categoria: "CARNE" }),
  posicao("peixe", 5, "LIVRE", { categoria: "PEIXE" }),
  posicao("batata", 6, "FIXA", { opcoes: ["batata-frita"] }),
  posicao("pastel", 7, "FIXA", { opcoes: ["pastel"] }),
  posicao("sobras", 1, "SOBRAS", { area: "RECHAUD" }),
  posicao("churrasco", 1, "FIXA", { area: "GRELHA", opcoes: ["churrasco"], dias: [6, 0] }),
];

export const mapaPratos = () => new Map(PRATOS.map((p) => [p.id, p]));
export const mapaPosicoes = () => new Map(POSICOES.map((p) => [p.id, p]));
