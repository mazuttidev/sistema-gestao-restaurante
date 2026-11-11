"use server";

import { revalidatePath } from "next/cache";
import { verificarSessao } from "@/lib/auth/dal";
import { ehDataISO } from "@/lib/gerador/datas";
import {
  definirTravado,
  gerarSemana,
  homologar,
  reabrir,
  trocarPrato,
  type ResultadoSemana,
} from "@/lib/semana/dados";

export type RespostaSemana = { erro?: string };

const MENSAGEM_ERRO = {
  homologado: "Esta semana já foi homologada. Reabra para fazer ajustes.",
  nao_encontrado: "Gere o cardápio da semana antes de ajustar.",
  posicao_invalida: "Esta posição não existe nesse dia. Recarregue a página.",
  prato_invalido: "Este prato não existe mais. Recarregue a página.",
} as const;

function responder(resultado: ResultadoSemana): RespostaSemana {
  revalidatePath("/semana");
  return resultado.ok ? {} : { erro: MENSAGEM_ERRO[resultado.erro] };
}

const DATA_INVALIDA: RespostaSemana = { erro: "Data inválida. Recarregue a página." };

/** Gera a semana inteira, mantendo os itens travados. */
export async function gerarSemanaAction(semanaInicio: string): Promise<RespostaSemana> {
  await verificarSessao();
  if (!ehDataISO(semanaInicio)) return DATA_INVALIDA;
  return responder(await gerarSemana(semanaInicio));
}

/** Regenera um dia, mantendo os itens travados e os outros dias. */
export async function regenerarDiaAction(
  semanaInicio: string,
  data: string,
): Promise<RespostaSemana> {
  await verificarSessao();
  if (!ehDataISO(semanaInicio) || !ehDataISO(data)) return DATA_INVALIDA;
  return responder(await gerarSemana(semanaInicio, [data]));
}

export async function trocarPratoAction(
  semanaInicio: string,
  data: string,
  posicaoId: string,
  pratoId: string | null,
): Promise<RespostaSemana> {
  await verificarSessao();
  if (!ehDataISO(semanaInicio) || !ehDataISO(data)) return DATA_INVALIDA;
  return responder(await trocarPrato(semanaInicio, data, posicaoId, pratoId));
}

export async function definirTravadoAction(
  semanaInicio: string,
  itemId: string,
  travado: boolean,
): Promise<RespostaSemana> {
  await verificarSessao();
  if (!ehDataISO(semanaInicio)) return DATA_INVALIDA;
  return responder(await definirTravado(semanaInicio, itemId, travado));
}

export async function homologarAction(semanaInicio: string): Promise<RespostaSemana> {
  await verificarSessao();
  if (!ehDataISO(semanaInicio)) return DATA_INVALIDA;
  return responder(await homologar(semanaInicio));
}

export async function reabrirAction(semanaInicio: string): Promise<RespostaSemana> {
  await verificarSessao();
  if (!ehDataISO(semanaInicio)) return DATA_INVALIDA;
  await reabrir(semanaInicio);
  return responder({ ok: true });
}
