import "server-only";
import { inicioDaSemana, type DataISO } from "@/lib/gerador/datas";
import { obterConfiguracao } from "@/lib/regras/dados";
import { obterSemana, type Semana } from "@/lib/semana/dados";
import { pratosDoDia } from "./texto";

// Só o cardápio homologado é exportado (RN10).

export type ErroExportacao = "sem_cardapio" | "nao_homologado" | "dia_fechado";

export const MENSAGEM_ERRO_EXPORTACAO: Record<ErroExportacao, string> = {
  sem_cardapio: "Ainda não há cardápio para esta semana.",
  nao_homologado: "Homologue o cardápio da semana antes de exportar.",
  dia_fechado: "O restaurante não abre neste dia.",
};

export async function obterSemanaHomologada(
  data: DataISO,
): Promise<{ ok: true; semana: Semana } | { ok: false; erro: ErroExportacao }> {
  const { diasFuncionamento } = await obterConfiguracao();
  const semana = await obterSemana(inicioDaSemana(data, diasFuncionamento));
  if (!semana.cardapio) return { ok: false, erro: "sem_cardapio" };
  if (semana.cardapio.status !== "HOMOLOGADO") return { ok: false, erro: "nao_homologado" };
  return { ok: true, semana };
}

/** Nomes dos pratos de cada dia de uma semana homologada, na ordem do buffet. */
export function pratosPorDia(semana: Semana): Map<DataISO, string[]> {
  const posicoes = new Map(semana.posicoes.map((p) => [p.id, p]));
  const nomes = new Map(semana.pratos.map((p) => [p.id, p.nome]));
  const itens = semana.cardapio?.itens ?? [];
  return new Map(semana.dias.map((d) => [d, pratosDoDia(d, itens, posicoes, nomes)]));
}

/** Nomes dos pratos de um dia homologado, na ordem do buffet. */
export async function obterPratosDoDia(
  data: DataISO,
): Promise<{ ok: true; pratos: string[] } | { ok: false; erro: ErroExportacao }> {
  const resultado = await obterSemanaHomologada(data);
  if (!resultado.ok) return resultado;
  const pratos = pratosPorDia(resultado.semana).get(data);
  if (!pratos) return { ok: false, erro: "dia_fechado" };
  return { ok: true, pratos };
}
