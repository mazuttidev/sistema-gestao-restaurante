import { describe, expect, it } from "vitest";
import { normalizarNome } from "./texto";

describe("normalizarNome", () => {
  it("remove acentos e deixa em minúsculas", () => {
    expect(normalizarNome("Feijão Preto")).toBe("feijao preto");
  });

  it("colapsa espaços e remove espaços nas pontas", () => {
    expect(normalizarNome("  Bife   à  milanesa ")).toBe("bife a milanesa");
  });

  it("trata grafias equivalentes como o mesmo prato", () => {
    expect(normalizarNome("Queijo à Dorê")).toBe(normalizarNome("queijo a dore"));
  });

  it("remove pontuação final", () => {
    expect(normalizarNome("Farofa caseira;")).toBe("farofa caseira");
  });
});
