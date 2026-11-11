import { describe, expect, it } from "vitest";
import { nomeArquivoTxt, pratosDoDia, textoMensagem, txtEtiquetas } from "./texto";

const posicoes = new Map([
  ["arroz", { area: "CUBA" as const, ordem: 1 }],
  ["feijao", { area: "CUBA" as const, ordem: 2 }],
  ["sobras", { area: "RECHAUD" as const, ordem: 6 }],
  ["grelha", { area: "GRELHA" as const, ordem: 1 }],
  ["extra", { area: "RECHAUD" as const, ordem: 7 }],
]);
const nomes = new Map([
  ["a", "Arroz branco"],
  ["f", "Feijão preto"],
  ["g", "Churrasco"],
]);
const item = (data: string, posicaoId: string, pratoId: string | null) => ({
  data,
  posicaoId,
  pratoId,
  travado: false,
});

describe("pratosDoDia", () => {
  it("lista os pratos do dia na ordem do buffet, sem vazios nem repetidos", () => {
    const itens = [
      item("2026-11-10", "grelha", "g"),
      item("2026-11-10", "feijao", "f"),
      item("2026-11-10", "sobras", null),
      item("2026-11-10", "arroz", "a"),
      item("2026-11-10", "extra", "a"),
      item("2026-11-11", "arroz", "a"),
    ];
    expect(pratosDoDia("2026-11-10", itens, posicoes, nomes)).toEqual([
      "Arroz branco",
      "Feijão preto",
      "Churrasco",
    ]);
  });
});

describe("txtEtiquetas", () => {
  it("usa um prato por linha com CRLF e sem linha final", () => {
    expect(txtEtiquetas(["Arroz branco", "Feijão preto"])).toBe("Arroz branco\r\nFeijão preto");
  });
});

describe("nomeArquivoTxt", () => {
  it("nomeia com a data no formato DD-MM-AAAA", () => {
    expect(nomeArquivoTxt("2026-11-10")).toBe("cardapio 10-11-2026.txt");
  });
});

describe("textoMensagem", () => {
  it("monta o texto para WhatsApp com título e marcadores", () => {
    expect(textoMensagem("2026-11-10", ["Arroz branco", "Feijão preto"])).toBe(
      "*Cardápio de terça, 10/11*\n\n• Arroz branco\n• Feijão preto\n\nRestaurante Botafogo",
    );
  });
});
