import {
  Categoria,
  MetodoPreparo,
  Restricao,
  type Categoria as TCategoria,
  type MetodoPreparo as TMetodoPreparo,
  type Restricao as TRestricao,
} from "@/generated/prisma/enums";

export { Categoria, MetodoPreparo, Restricao };

export const ROTULO_CATEGORIA: Record<TCategoria, string> = {
  ARROZ: "Arroz",
  FEIJAO: "Feijão",
  MASSA: "Massa",
  CARNE: "Carne",
  FRANGO: "Frango",
  PEIXE: "Peixe",
  SUINO: "Suíno",
  RISOTO: "Risoto",
  POLENTA: "Polenta",
  LEGUME: "Legume/Salada",
  SALGADO: "Salgado/Frito",
  QUEIJO: "Queijo",
  GRELHA: "Grelha",
  OUTRO: "Outro",
};

export const ROTULO_PREPARO: Record<TMetodoPreparo, string> = {
  FORNO: "Forno",
  GRELHA: "Grelha/Espeto",
  FRITADEIRA: "Fritadeira",
  PANELA: "Panela",
  NENHUM: "Nenhum",
};

export const ROTULO_RESTRICAO: Record<TRestricao, string> = {
  SEM_LACTOSE: "Sem lactose",
  SEM_GLUTEN: "Sem glúten",
  VEGANO: "Vegano",
  VEGETARIANO: "Vegetariano",
};

/** Pratos da fritadeira contam para o limite de fritos do dia (RN06). */
export function ehFrito(preparo: TMetodoPreparo): boolean {
  return preparo === "FRITADEIRA";
}
