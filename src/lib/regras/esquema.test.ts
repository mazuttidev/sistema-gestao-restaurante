import { describe, expect, it } from "vitest";
import {
  errosPorCampo,
  lerFormularioConfiguracao,
  lerFormularioPosicao,
  type ErrosPosicao,
} from "./esquema";
import { resumoDias } from "./rotulos";

function formulario(campos: Record<string, string | string[]>) {
  const dados = new FormData();
  for (const [campo, valor] of Object.entries(campos)) {
    for (const v of Array.isArray(valor) ? valor : [valor]) dados.append(campo, v);
  }
  return dados;
}

describe("lerFormularioConfiguracao", () => {
  it("lê dias, limites e a regra de dias seguidos", () => {
    const resultado = lerFormularioConfiguracao(
      formulario({
        diasFuncionamento: ["0", "2", "3", "2"],
        maxFritosDia: "4",
        semanasSemRepetir: "1",
        naoRepetirDiasSeguidos: "on",
      }),
    );
    expect(resultado.data).toEqual({
      diasFuncionamento: [0, 2, 3],
      maxFritosDia: 4,
      semanasSemRepetir: 1,
      naoRepetirDiasSeguidos: true,
    });
  });

  it("exige ao menos um dia e limites dentro da faixa", () => {
    const resultado = lerFormularioConfiguracao(
      formulario({ maxFritosDia: "-1", semanasSemRepetir: "9" }),
    );
    expect(resultado.success).toBe(false);
    expect(Object.keys(errosPorCampo(resultado.error!))).toEqual([
      "diasFuncionamento",
      "maxFritosDia",
      "semanasSemRepetir",
    ]);
  });
});

describe("lerFormularioPosicao", () => {
  const base = { nome: "Massa", area: "CUBA", ordem: "3", ativa: "on" };

  it("aceita posição livre com categoria e descarta opções", () => {
    const resultado = lerFormularioPosicao(
      formulario({ ...base, tipo: "LIVRE", categoria: "MASSA", opcoes: ["x"] }),
    );
    expect(resultado.data).toMatchObject({
      tipo: "LIVRE",
      categoria: "MASSA",
      opcoes: [],
      dias: [],
      ativa: true,
    });
  });

  it("exige categoria na posição livre", () => {
    const resultado = lerFormularioPosicao(formulario({ ...base, tipo: "LIVRE" }));
    expect(errosPorCampo<keyof ErrosPosicao>(resultado.error!)).toHaveProperty("categoria");
  });

  it("exige exatamente um prato na fixa e descarta a categoria", () => {
    const erro = lerFormularioPosicao(formulario({ ...base, tipo: "FIXA", opcoes: ["a", "b"] }));
    expect(errosPorCampo<keyof ErrosPosicao>(erro.error!).opcoes).toBe("Escolha um prato.");

    const ok = lerFormularioPosicao(
      formulario({ ...base, tipo: "FIXA", categoria: "MASSA", opcoes: ["a"] }),
    );
    expect(ok.data).toMatchObject({ opcoes: ["a"], categoria: null });
  });

  it("exige dois ou mais pratos na fixa com variação", () => {
    const erro = lerFormularioPosicao(formulario({ ...base, tipo: "VARIAVEL", opcoes: ["a"] }));
    expect(erro.success).toBe(false);
    const ok = lerFormularioPosicao(
      formulario({ ...base, tipo: "VARIAVEL", opcoes: ["a", "b", "a"], dias: ["6", "0"] }),
    );
    expect(ok.data).toMatchObject({ opcoes: ["a", "b"], dias: [0, 6] });
  });

  it("valida nome, área e número", () => {
    const resultado = lerFormularioPosicao(
      formulario({ nome: "x", area: "BALCAO", ordem: "0", tipo: "SOBRAS" }),
    );
    expect(Object.keys(errosPorCampo(resultado.error!))).toEqual(["nome", "area", "ordem"]);
  });
});

describe("resumoDias", () => {
  const TER_A_DOM = [2, 3, 4, 5, 6, 0];

  it("resume os dias em que a posição existe", () => {
    expect(resumoDias([], TER_A_DOM)).toBe("Todos os dias");
    expect(resumoDias([0, 6], TER_A_DOM)).toBe("Sáb, Dom");
    expect(resumoDias([1], TER_A_DOM)).toBe("Nenhum dia de funcionamento");
  });
});
