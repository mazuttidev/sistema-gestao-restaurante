import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizarNome } from "@/lib/texto";
import type { DadosPrato } from "./esquema";
import { filtrosParaWhere, type FiltrosPratos } from "./filtros";

// Funções de dados de pratos. Quem chama (server actions e páginas) já verificou a sessão.

const camposLista = {
  id: true,
  nome: true,
  categoria: true,
  preparo: true,
  cubas: true,
  restricoes: true,
  ativo: true,
} satisfies Prisma.PratoSelect;

export async function listarPratos(filtros: FiltrosPratos) {
  const [pratos, total] = await Promise.all([
    prisma.prato.findMany({
      where: filtrosParaWhere(filtros),
      // Ordena pelo nome sem acentos: "Arroz à grega" antes de "Arroz integral".
      orderBy: [{ categoria: "asc" }, { nomeNormalizado: "asc" }],
      select: camposLista,
    }),
    prisma.prato.count(),
  ]);
  return { pratos, total };
}

export type PratoDaLista = Awaited<ReturnType<typeof listarPratos>>["pratos"][number];

export function obterPrato(id: string) {
  return prisma.prato.findUnique({
    where: { id },
    select: { ...camposLista, observacao: true },
  });
}

export type PratoCompleto = NonNullable<Awaited<ReturnType<typeof obterPrato>>>;

export type ResultadoSalvar =
  { ok: true } | { ok: false; erro: "nome_duplicado" | "nao_encontrado" };

/** Cria (id nulo) ou atualiza um prato. Nomes iguais a menos de acento/caixa são duplicados. */
export async function salvarPrato(id: string | null, dados: DadosPrato): Promise<ResultadoSalvar> {
  const data = { ...dados, nomeNormalizado: normalizarNome(dados.nome) };
  try {
    if (id) await prisma.prato.update({ where: { id }, data });
    else await prisma.prato.create({ data });
    return { ok: true };
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError) {
      if (erro.code === "P2002") return { ok: false, erro: "nome_duplicado" };
      if (erro.code === "P2025") return { ok: false, erro: "nao_encontrado" };
    }
    throw erro;
  }
}

export async function definirAtivo(id: string, ativo: boolean): Promise<void> {
  await prisma.prato.updateMany({ where: { id }, data: { ativo } });
}

export type ResultadoRemover =
  { acao: "excluido" } | { acao: "desativado" } | { acao: "bloqueado"; posicoes: string[] };

/**
 * Exclui o prato, a menos que:
 * - seja opção de uma posição do buffet (bloqueia: a posição ficaria sem prato);
 * - já tenha sido servido em algum cardápio (desativa, para preservar o histórico).
 */
export async function removerPrato(id: string): Promise<ResultadoRemover> {
  const prato = await prisma.prato.findUnique({
    where: { id },
    select: {
      _count: { select: { itens: true } },
      opcoesDePosicao: { select: { posicao: { select: { nome: true } } } },
    },
  });
  if (!prato) return { acao: "excluido" };

  if (prato.opcoesDePosicao.length > 0) {
    return { acao: "bloqueado", posicoes: prato.opcoesDePosicao.map((o) => o.posicao.nome) };
  }
  if (prato._count.itens > 0) {
    await definirAtivo(id, false);
    return { acao: "desativado" };
  }
  await prisma.prato.delete({ where: { id } });
  return { acao: "excluido" };
}
