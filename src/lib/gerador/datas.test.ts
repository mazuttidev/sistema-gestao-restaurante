import { describe, expect, it } from "vitest";
import {
  diaDaSemana,
  diaInicialDaSemana,
  diaMes,
  diasDaSemana,
  inicioDaSemana,
  nomeDoDia,
  paraDataISO,
  somarDias,
} from "./datas";

const TER_A_DOM = [2, 3, 4, 5, 6, 0];

describe("datas", () => {
  it("converte Date em AAAA-MM-DD pelo UTC", () => {
    expect(paraDataISO(new Date("2026-11-10T00:00:00.000Z"))).toBe("2026-11-10");
  });

  it("soma dias atravessando o mês", () => {
    expect(somarDias("2026-11-29", 3)).toBe("2026-12-02");
    expect(somarDias("2026-11-01", -1)).toBe("2026-10-31");
  });

  it("calcula o dia da semana (10/11/2026 é terça)", () => {
    expect(diaDaSemana("2026-11-10")).toBe(2);
    expect(nomeDoDia("2026-11-15")).toBe("Domingo");
  });

  it("começa a semana no primeiro dia de funcionamento a partir da segunda", () => {
    expect(diaInicialDaSemana(TER_A_DOM)).toBe(2);
    expect(diaInicialDaSemana([1, 2, 3, 4, 5, 6])).toBe(1);
    expect(diaInicialDaSemana([0, 6])).toBe(6);
  });

  it("acha o início da semana de qualquer data", () => {
    expect(inicioDaSemana("2026-11-10", TER_A_DOM)).toBe("2026-11-10");
    expect(inicioDaSemana("2026-11-15", TER_A_DOM)).toBe("2026-11-10");
    // Segunda (fechado) pertence à semana que começou na terça anterior.
    expect(inicioDaSemana("2026-11-16", TER_A_DOM)).toBe("2026-11-10");
  });

  it("lista os dias de funcionamento da semana", () => {
    expect(diasDaSemana("2026-11-10", TER_A_DOM)).toEqual([
      "2026-11-10",
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
      "2026-11-14",
      "2026-11-15",
    ]);
  });

  it("formata dia/mês", () => {
    expect(diaMes("2026-11-05")).toBe("05/11");
  });
});
