import { describe, expect, it } from "vitest";
import {
  diaDaSemana,
  diaInicialDaSemana,
  diaMes,
  diasDaSemana,
  ehDataISO,
  hojeNoRestaurante,
  inicioDaSemana,
  nomeDoDia,
  paraDataISO,
  semanaPadrao,
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

  it("abre a semana em curso, ou a próxima no dia de folga", () => {
    expect(semanaPadrao("2026-11-12", TER_A_DOM)).toBe("2026-11-10"); // quinta
    expect(semanaPadrao("2026-11-15", TER_A_DOM)).toBe("2026-11-10"); // domingo
    expect(semanaPadrao("2026-11-16", TER_A_DOM)).toBe("2026-11-17"); // segunda (fechado)
  });

  it("pega a data de hoje no fuso de São Paulo", () => {
    // 01:00 UTC do dia 11 ainda é dia 10 em São Paulo (UTC-3).
    expect(hojeNoRestaurante(new Date("2026-11-11T01:00:00Z"))).toBe("2026-11-10");
  });

  it("valida datas AAAA-MM-DD", () => {
    expect(ehDataISO("2026-11-10")).toBe(true);
    expect(ehDataISO("2026-02-30")).toBe(false);
    expect(ehDataISO("10/11/2026")).toBe(false);
    expect(ehDataISO(undefined)).toBe(false);
  });

  it("formata dia/mês", () => {
    expect(diaMes("2026-11-05")).toBe("05/11");
  });
});
