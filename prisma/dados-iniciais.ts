import type { Area, Categoria, TipoPosicao } from "../src/generated/prisma/client";
import catalogo from "./pratos-historicos.json";
import { esquemaPrato } from "../src/lib/pratos/esquema";
import { normalizarNome } from "../src/lib/texto";

export const PRATOS = catalogo.map((prato) => esquemaPrato.parse(prato));
const nomes = PRATOS.map((p) => normalizarNome(p.nome));
if (new Set(nomes).size !== nomes.length) throw new Error("Catálogo contém nomes duplicados");

export type PosicaoSeed = {
  area: Area;
  ordem: number;
  nome: string;
  tipo: TipoPosicao;
  categoria?: Categoria;
  opcoes?: string[];
  dias?: number[];
};

export const POSICOES: PosicaoSeed[] = [
  { area: "CUBA", ordem: 1, nome: "Arroz", tipo: "FIXA", opcoes: ["Arroz branco"] },
  {
    area: "CUBA",
    ordem: 2,
    nome: "Feijão",
    tipo: "VARIAVEL",
    opcoes: ["Feijão preto", "Feijão carioca", "Feijão vermelho", "Feijoada", "Lentilha"],
  },
  { area: "CUBA", ordem: 3, nome: "Massa", tipo: "LIVRE", categoria: "MASSA" },
  { area: "CUBA", ordem: 4, nome: "Carne", tipo: "LIVRE", categoria: "CARNE" },
  { area: "CUBA", ordem: 5, nome: "Peixe", tipo: "LIVRE", categoria: "PEIXE" },
  { area: "CUBA", ordem: 6, nome: "Frango", tipo: "LIVRE", categoria: "FRANGO" },
  { area: "CUBA", ordem: 7, nome: "Batata frita", tipo: "FIXA", opcoes: ["Batata frita"] },
  { area: "CUBA", ordem: 8, nome: "Pastel", tipo: "FIXA", opcoes: ["Pastel de carne"] },
  {
    area: "CUBA",
    ordem: 9,
    nome: "Queijo",
    tipo: "VARIAVEL",
    opcoes: [
      "Queijo grelhado",
      "Queijo à dorê",
      "Queijo no espeto",
      "Queijo à milanesa",
      "Queijo assado",
      "Suflê de queijo e batata palha",
      "Moqueca de queijo",
      "Estrogonofe de queijo",
    ],
  },
  { area: "RECHAUD", ordem: 1, nome: "Risoto", tipo: "LIVRE", categoria: "RISOTO" },
  {
    area: "RECHAUD",
    ordem: 2,
    nome: "Polenta",
    tipo: "VARIAVEL",
    opcoes: ["Polenta frita", "Polenta mole", "Polenta brustolada", "Polenta à milanesa"],
  },
  { area: "RECHAUD", ordem: 3, nome: "Legume", tipo: "LIVRE", categoria: "LEGUME" },
  { area: "RECHAUD", ordem: 4, nome: "Suíno", tipo: "LIVRE", categoria: "SUINO" },
  {
    area: "RECHAUD",
    ordem: 5,
    nome: "Arroz integral",
    tipo: "FIXA",
    opcoes: ["Arroz integral"],
  },
  { area: "RECHAUD", ordem: 6, nome: "Sobras", tipo: "SOBRAS" },
  { area: "RECHAUD", ordem: 7, nome: "Farofa", tipo: "FIXA", opcoes: ["Farofa caseira"] },
  {
    area: "GRELHA",
    ordem: 1,
    nome: "Grelha",
    tipo: "VARIAVEL",
    opcoes: ["Bife de gado grelhado", "Queijo grelhado", "Hambúrguer", "Bife de frango"],
    dias: [2, 3, 4, 5],
  },
  {
    area: "GRELHA",
    ordem: 2,
    nome: "Churrasco",
    tipo: "FIXA",
    opcoes: ["Churrasco"],
    dias: [6, 0],
  },
];

for (const posicao of POSICOES) {
  for (const nome of posicao.opcoes ?? []) {
    if (!nomes.includes(normalizarNome(nome))) {
      throw new Error(`Opção "${nome}" da posição "${posicao.nome}" não existe no catálogo`);
    }
  }
}
