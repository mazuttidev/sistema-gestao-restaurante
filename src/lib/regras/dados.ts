import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { ordemPosicao } from "@/lib/gerador/analise";
import { prisma } from "@/lib/prisma";
import type { DadosConfiguracao, DadosPosicao } from "./esquema";

// Funções de dados das regras. Quem chama (server actions e páginas) já verificou a sessão.

/** Configuração única (id = 1); criada com os padrões se ainda não existir. */
export function obterConfiguracao() {
  return prisma.configuracao.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
}

export async function salvarConfiguracao(dados: DadosConfiguracao): Promise<void> {
  await prisma.configuracao.upsert({
    where: { id: 1 },
    update: dados,
    create: { id: 1, ...dados },
  });
}

const camposPosicao = {
  id: true,
  area: true,
  ordem: true,
  nome: true,
  tipo: true,
  categoria: true,
  dias: true,
  ativa: true,
  opcoes: { select: { prato: { select: { id: true, nome: true, ativo: true } } } },
} satisfies Prisma.PosicaoSelect;

/** Posições na ordem do buffet: cubas, rechauds e grelha. */
export async function listarPosicoes() {
  const posicoes = await prisma.posicao.findMany({ select: camposPosicao });
  return posicoes.sort((a, b) => ordemPosicao(a) - ordemPosicao(b));
}

export type PosicaoDaLista = Awaited<ReturnType<typeof listarPosicoes>>[number];

export function obterPosicao(id: string) {
  return prisma.posicao.findUnique({ where: { id }, select: camposPosicao });
}

export type PosicaoCompleta = NonNullable<Awaited<ReturnType<typeof obterPosicao>>>;

/** Próximo número livre na área, para sugerir ao criar uma posição. */
export async function proximaOrdem(area: PosicaoCompleta["area"]): Promise<number> {
  const ultima = await prisma.posicao.aggregate({ where: { area }, _max: { ordem: true } });
  return (ultima._max.ordem ?? 0) + 1;
}

export type ResultadoSalvarPosicao =
  { ok: true } | { ok: false; erro: "ordem_duplicada" | "nao_encontrado" | "prato_inexistente" };

/** Cria (id nulo) ou atualiza uma posição e troca as opções de prato numa transação. */
export async function salvarPosicao(
  id: string | null,
  { opcoes, ...dados }: DadosPosicao,
): Promise<ResultadoSalvarPosicao> {
  try {
    await prisma.$transaction(async (tx) => {
      const posicao = id
        ? await tx.posicao.update({ where: { id }, data: dados, select: { id: true } })
        : await tx.posicao.create({ data: dados, select: { id: true } });
      await tx.posicaoOpcao.deleteMany({ where: { posicaoId: posicao.id } });
      if (opcoes.length > 0) {
        await tx.posicaoOpcao.createMany({
          data: opcoes.map((pratoId) => ({ posicaoId: posicao.id, pratoId })),
        });
      }
    });
    return { ok: true };
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError) {
      if (erro.code === "P2002") return { ok: false, erro: "ordem_duplicada" };
      if (erro.code === "P2025") return { ok: false, erro: "nao_encontrado" };
      if (erro.code === "P2003") return { ok: false, erro: "prato_inexistente" };
    }
    throw erro;
  }
}

export type ResultadoRemoverPosicao = { acao: "excluida" } | { acao: "desativada" };

/** Exclui a posição; se já foi usada em algum cardápio, desativa para preservar o histórico. */
export async function removerPosicao(id: string): Promise<ResultadoRemoverPosicao> {
  const usos = await prisma.itemCardapio.count({ where: { posicaoId: id } });
  if (usos > 0) {
    await prisma.posicao.updateMany({ where: { id }, data: { ativa: false } });
    return { acao: "desativada" };
  }
  await prisma.posicao.deleteMany({ where: { id } });
  return { acao: "excluida" };
}

/** Pratos ativos (e os já escolhidos, mesmo inativos) para montar as opções de uma posição. */
export function listarPratosParaOpcoes(incluir: string[] = []) {
  return prisma.prato.findMany({
    where: { OR: [{ ativo: true }, { id: { in: incluir } }] },
    orderBy: [{ categoria: "asc" }, { nomeNormalizado: "asc" }],
    select: { id: true, nome: true, categoria: true, ativo: true },
  });
}

export type PratoOpcao = Awaited<ReturnType<typeof listarPratosParaOpcoes>>[number];
