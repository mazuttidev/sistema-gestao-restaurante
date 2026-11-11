import "server-only";
import { analisarCardapio, type ResumoDia } from "@/lib/gerador/analise";
import { deDataISO, diasDaSemana, paraDataISO, somarDias, type DataISO } from "@/lib/gerador/datas";
import { gerarCardapio, posicaoExisteNoDia } from "@/lib/gerador/gerador";
import type {
  ItemGerado,
  ItemHistorico,
  PosicaoGerador,
  PratoGerador,
  RegrasGerador,
} from "@/lib/gerador/tipos";
import { prisma } from "@/lib/prisma";
import { obterConfiguracao } from "@/lib/regras/dados";

// Dados do cardápio da semana. Quem chama (server actions e páginas) já verificou a sessão.

export type PratoDaSemana = PratoGerador & { cubas: number };

async function carregarBase() {
  const [configuracao, pratos, posicoes] = await Promise.all([
    obterConfiguracao(),
    prisma.prato.findMany({
      orderBy: [{ categoria: "asc" }, { nomeNormalizado: "asc" }],
      select: { id: true, nome: true, categoria: true, preparo: true, ativo: true, cubas: true },
    }),
    prisma.posicao.findMany({
      include: { opcoes: { select: { pratoId: true } } },
    }),
  ]);
  const regras: RegrasGerador = {
    diasFuncionamento: configuracao.diasFuncionamento,
    maxFritosDia: configuracao.maxFritosDia,
    semanasSemRepetir: configuracao.semanasSemRepetir,
    naoRepetirDiasSeguidos: configuracao.naoRepetirDiasSeguidos,
  };
  const posicoesGerador: PosicaoGerador[] = posicoes.map(({ opcoes, ...p }) => ({
    ...p,
    opcoes: opcoes.map((o) => o.pratoId),
  }));
  return { regras, pratos: pratos as PratoDaSemana[], posicoes: posicoesGerador };
}

/** Pratos servidos nas semanas anteriores dentro da janela de não repetição. */
async function carregarHistorico(semanaInicio: DataISO, semanas: number): Promise<ItemHistorico[]> {
  if (semanas <= 0) return [];
  const itens = await prisma.itemCardapio.findMany({
    where: {
      pratoId: { not: null },
      data: { gte: deDataISO(somarDias(semanaInicio, -7 * semanas)), lt: deDataISO(semanaInicio) },
    },
    select: { data: true, pratoId: true },
  });
  return itens.map((i) => ({ data: paraDataISO(i.data), pratoId: i.pratoId! }));
}

async function carregarCardapio(semanaInicio: DataISO) {
  return prisma.cardapio.findUnique({
    where: { semanaInicio: deDataISO(semanaInicio) },
    include: {
      itens: { select: { id: true, data: true, posicaoId: true, pratoId: true, travado: true } },
    },
  });
}

export type ItemDaSemana = ItemGerado & { id: string };

export type Semana = {
  semanaInicio: DataISO;
  dias: DataISO[];
  regras: RegrasGerador;
  pratos: PratoDaSemana[];
  posicoes: PosicaoGerador[];
  cardapio: {
    id: string;
    status: "RASCUNHO" | "HOMOLOGADO";
    homologadoEm: Date | null;
    itens: ItemDaSemana[];
  } | null;
  resumo: ResumoDia[];
};

/** Tudo que a tela da semana precisa: estrutura, pratos, itens e a análise das regras. */
export async function obterSemana(semanaInicio: DataISO): Promise<Semana> {
  const { regras, pratos, posicoes } = await carregarBase();
  const [cardapio, historico] = await Promise.all([
    carregarCardapio(semanaInicio),
    carregarHistorico(semanaInicio, regras.semanasSemRepetir),
  ]);
  const dias = diasDaSemana(semanaInicio, regras.diasFuncionamento);
  const itens: ItemDaSemana[] =
    cardapio?.itens.map((i) => ({ ...i, data: paraDataISO(i.data) })) ?? [];

  const resumo = analisarCardapio({
    semanaInicio,
    dias,
    itens,
    pratos: new Map(pratos.map((p) => [p.id, p])),
    posicoes: new Map(posicoes.map((p) => [p.id, p])),
    regras,
    historico,
  });

  return {
    semanaInicio,
    dias,
    regras,
    pratos,
    posicoes,
    cardapio: cardapio && {
      id: cardapio.id,
      status: cardapio.status,
      homologadoEm: cardapio.homologadoEm,
      itens,
    },
    resumo,
  };
}

export type ErroSemana = "homologado" | "nao_encontrado" | "posicao_invalida" | "prato_invalido";
export type ResultadoSemana = { ok: true } | { ok: false; erro: ErroSemana };

/**
 * Gera (ou regenera) a semana. Itens travados são mantidos; com `apenasDias`, os outros
 * dias também. Os itens são substituídos numa transação.
 */
export async function gerarSemana(
  semanaInicio: DataISO,
  apenasDias?: DataISO[],
): Promise<ResultadoSemana> {
  const { regras, pratos, posicoes } = await carregarBase();
  const [cardapio, historico] = await Promise.all([
    carregarCardapio(semanaInicio),
    carregarHistorico(semanaInicio, regras.semanasSemRepetir),
  ]);
  if (cardapio?.status === "HOMOLOGADO") return { ok: false, erro: "homologado" };

  const atuais = cardapio?.itens.map((i) => ({ ...i, data: paraDataISO(i.data) })) ?? [];
  const resultado = gerarCardapio({
    semanaInicio,
    pratos,
    posicoes,
    regras,
    historico,
    atuais,
    apenasDias,
  });

  await prisma.$transaction(async (tx) => {
    const { id } = await tx.cardapio.upsert({
      where: { semanaInicio: deDataISO(semanaInicio) },
      update: {},
      create: { semanaInicio: deDataISO(semanaInicio) },
      select: { id: true },
    });
    // Substitui tudo: itens de dias que deixaram de funcionar ou de posições removidas saem.
    await tx.itemCardapio.deleteMany({ where: { cardapioId: id } });
    await tx.itemCardapio.createMany({
      data: resultado.itens.map((i) => ({
        cardapioId: id,
        data: deDataISO(i.data),
        posicaoId: i.posicaoId,
        pratoId: i.pratoId,
        travado: i.travado,
      })),
    });
  });
  return { ok: true };
}

async function cardapioEditavel(
  semanaInicio: DataISO,
): Promise<{ id: string; erro?: never } | { erro: "nao_encontrado" | "homologado" }> {
  const cardapio = await prisma.cardapio.findUnique({
    where: { semanaInicio: deDataISO(semanaInicio) },
    select: { id: true, status: true },
  });
  if (!cardapio) return { erro: "nao_encontrado" as const };
  if (cardapio.status === "HOMOLOGADO") return { erro: "homologado" as const };
  return { id: cardapio.id };
}

/**
 * Troca o prato de uma posição num dia (RF09). Qualquer prato pode ser escolhido à mão;
 * as regras violadas aparecem como alertas na grade (RF10). O item trocado fica travado
 * para não ser desfeito ao regenerar.
 */
export async function trocarPrato(
  semanaInicio: DataISO,
  data: DataISO,
  posicaoId: string,
  pratoId: string | null,
): Promise<ResultadoSemana> {
  const cardapio = await cardapioEditavel(semanaInicio);
  if (cardapio.erro) return { ok: false, erro: cardapio.erro };

  const [configuracao, posicao] = await Promise.all([
    obterConfiguracao(),
    prisma.posicao.findUnique({ where: { id: posicaoId } }),
  ]);
  const dias = diasDaSemana(semanaInicio, configuracao.diasFuncionamento);
  if (!posicao || !dias.includes(data) || !posicaoExisteNoDia({ ...posicao, opcoes: [] }, data)) {
    return { ok: false, erro: "posicao_invalida" };
  }
  if (pratoId) {
    const prato = await prisma.prato.findUnique({ where: { id: pratoId }, select: { id: true } });
    if (!prato) return { ok: false, erro: "prato_invalido" };
  }

  await prisma.itemCardapio.upsert({
    where: {
      cardapioId_data_posicaoId: { cardapioId: cardapio.id, data: deDataISO(data), posicaoId },
    },
    update: { pratoId, travado: true },
    create: { cardapioId: cardapio.id, data: deDataISO(data), posicaoId, pratoId, travado: true },
  });
  return { ok: true };
}

export async function definirTravado(
  semanaInicio: DataISO,
  itemId: string,
  travado: boolean,
): Promise<ResultadoSemana> {
  const cardapio = await cardapioEditavel(semanaInicio);
  if (cardapio.erro) return { ok: false, erro: cardapio.erro };
  await prisma.itemCardapio.updateMany({
    where: { id: itemId, cardapioId: cardapio.id },
    data: { travado },
  });
  return { ok: true };
}

/** Homologa (RN10): o cardápio fica somente leitura e passa a valer para exportação. */
export async function homologar(semanaInicio: DataISO): Promise<ResultadoSemana> {
  const cardapio = await cardapioEditavel(semanaInicio);
  if (cardapio.erro) return { ok: false, erro: cardapio.erro };
  await prisma.cardapio.update({
    where: { id: cardapio.id },
    data: { status: "HOMOLOGADO", homologadoEm: new Date() },
  });
  return { ok: true };
}

export async function reabrir(semanaInicio: DataISO): Promise<void> {
  await prisma.cardapio.updateMany({
    where: { semanaInicio: deDataISO(semanaInicio) },
    data: { status: "RASCUNHO", homologadoEm: null },
  });
}
