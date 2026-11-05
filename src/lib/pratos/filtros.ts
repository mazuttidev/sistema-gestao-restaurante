import type { Prisma } from "@/generated/prisma/client";
import { normalizarNome } from "@/lib/texto";
import {
  Categoria,
  MetodoPreparo,
  type Categoria as TCategoria,
  type MetodoPreparo as TMetodoPreparo,
} from "./rotulos";

export type StatusFiltro = "ativos" | "inativos" | "todos";

export type FiltrosPratos = {
  busca: string;
  categoria?: TCategoria;
  preparo?: TMetodoPreparo;
  status: StatusFiltro;
};

type ParametrosBusca = Record<string, string | string[] | undefined>;

function valorUnico(valor: string | string[] | undefined): string | undefined {
  return typeof valor === "string" ? valor : undefined;
}

function umDe<T extends string>(opcoes: Record<string, T>, valor: string | undefined) {
  return valor && Object.values(opcoes).includes(valor as T) ? (valor as T) : undefined;
}

/** Lê os filtros da URL; valores inválidos são ignorados. */
export function lerFiltros(parametros: ParametrosBusca): FiltrosPratos {
  const status = valorUnico(parametros.status);
  const filtros: FiltrosPratos = {
    busca: valorUnico(parametros.q)?.trim() ?? "",
    status: status === "inativos" || status === "todos" ? status : "ativos",
  };
  const categoria = umDe(Categoria, valorUnico(parametros.categoria));
  const preparo = umDe(MetodoPreparo, valorUnico(parametros.preparo));
  if (categoria) filtros.categoria = categoria;
  if (preparo) filtros.preparo = preparo;
  return filtros;
}

export function filtrosParaWhere(filtros: FiltrosPratos): Prisma.PratoWhereInput {
  const where: Prisma.PratoWhereInput = {};
  if (filtros.busca) where.nomeNormalizado = { contains: normalizarNome(filtros.busca) };
  if (filtros.categoria) where.categoria = filtros.categoria;
  if (filtros.preparo) where.preparo = filtros.preparo;
  if (filtros.status !== "todos") where.ativo = filtros.status === "ativos";
  return where;
}
