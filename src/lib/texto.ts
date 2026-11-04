/** Chave de comparação de nomes de pratos: sem acentos, minúsculas, espaços simples e sem pontuação final. */
export function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.;,:/-]+$/, "")
    .trim();
}
