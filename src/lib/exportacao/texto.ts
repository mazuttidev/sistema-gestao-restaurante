import { ordemPosicao } from "@/lib/gerador/analise";
import { diaMes, nomeDoDia, type DataISO } from "@/lib/gerador/datas";
import type { ItemGerado, PosicaoGerador } from "@/lib/gerador/tipos";

// Textos exportados do cardápio do dia (RF14 e RF16). Funções puras.

/** Nomes dos pratos do dia na ordem do buffet (cubas, rechauds, grelha), sem vazios. */
export function pratosDoDia(
  data: DataISO,
  itens: ItemGerado[],
  posicoes: Map<string, Pick<PosicaoGerador, "area" | "ordem">>,
  nomes: Map<string, string>,
): string[] {
  return itens
    .filter((i) => i.data === data && i.pratoId)
    .sort(
      (a, b) => ordemPosicao(posicoes.get(a.posicaoId)) - ordemPosicao(posicoes.get(b.posicaoId)),
    )
    .map((i) => nomes.get(i.pratoId!))
    .filter((nome): nome is string => Boolean(nome))
    .filter((nome, indice, todos) => todos.indexOf(nome) === indice);
}

/**
 * Arquivo das etiquetas do buffet, no formato que o restaurante já usa
 * (docs/ANALISE_CARDAPIOS.md §5): um prato por linha, CRLF, sem cabeçalho nem linha final.
 */
export function txtEtiquetas(pratos: string[]): string {
  return pratos.join("\r\n");
}

/** "cardapio 10-11-2026.txt" */
export function nomeArquivoTxt(data: DataISO): string {
  const [ano, mes, dia] = data.split("-");
  return `cardapio ${dia}-${mes}-${ano}.txt`;
}

/** Texto para WhatsApp e redes: título em negrito e um prato por linha. */
export function textoMensagem(data: DataISO, pratos: string[]): string {
  const titulo = `*Cardápio de ${nomeDoDia(data).toLowerCase()}, ${diaMes(data)}*`;
  return [titulo, "", ...pratos.map((p) => `• ${p}`), "", "Restaurante Botafogo"].join("\n");
}
