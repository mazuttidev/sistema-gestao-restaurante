import { describe, expect, it } from "vitest";
import { filtrosParaWhere, lerFiltros } from "./filtros";

describe("lerFiltros", () => {
  it("usa o padrão: sem busca e só pratos ativos", () => {
    expect(lerFiltros({})).toEqual({ busca: "", status: "ativos" });
  });

  it("lê busca, categoria, preparo e status válidos", () => {
    expect(
      lerFiltros({ q: " frango ", categoria: "FRANGO", preparo: "FRITADEIRA", status: "todos" }),
    ).toEqual({ busca: "frango", categoria: "FRANGO", preparo: "FRITADEIRA", status: "todos" });
  });

  it("ignora valores inválidos ou repetidos", () => {
    expect(
      lerFiltros({ categoria: "SOBREMESA", preparo: ["FORNO", "GRELHA"], status: "x" }),
    ).toEqual({ busca: "", status: "ativos" });
  });
});

describe("filtrosParaWhere", () => {
  it("busca pelo nome normalizado, sem acento", () => {
    expect(filtrosParaWhere({ busca: "Feijão", status: "todos" })).toEqual({
      nomeNormalizado: { contains: "feijao" },
    });
  });

  it("combina categoria, preparo e status", () => {
    expect(
      filtrosParaWhere({ busca: "", categoria: "PEIXE", preparo: "GRELHA", status: "inativos" }),
    ).toEqual({ categoria: "PEIXE", preparo: "GRELHA", ativo: false });
  });
});
