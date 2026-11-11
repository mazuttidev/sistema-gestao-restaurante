import { describe, expect, it } from "vitest";
import { DIAS, REGRAS, SEMANA, mapaPosicoes, mapaPratos } from "./__testes__/cenario";
import { analisarCardapio, pratosDasSemanasAnteriores } from "./analise";
import type { ItemGerado, ItemHistorico } from "./tipos";

function item(data: string, posicaoId: string, pratoId: string | null): ItemGerado {
  return { data, posicaoId, pratoId, travado: false };
}

function analisar(itens: ItemGerado[], historico: ItemHistorico[] = [], regras = REGRAS) {
  return analisarCardapio({
    semanaInicio: SEMANA,
    dias: DIAS.slice(0, 2),
    itens,
    pratos: mapaPratos(),
    posicoes: mapaPosicoes(),
    regras,
    historico,
  });
}

const tipos = (dia: { alertas: { tipo: string }[] }) => dia.alertas.map((a) => a.tipo);

describe("pratosDasSemanasAnteriores", () => {
  const historico = [
    { data: "2026-11-08", pratoId: "a" }, // semana anterior
    { data: "2026-11-03", pratoId: "b" }, // primeiro dia da janela de 1 semana
    { data: "2026-11-02", pratoId: "c" }, // fora da janela de 1 semana
    { data: "2026-11-10", pratoId: "d" }, // a própria semana: não conta
  ];

  it("considera só a janela configurada", () => {
    expect(pratosDasSemanasAnteriores(historico, SEMANA, 1)).toEqual(new Set(["a", "b"]));
    expect(pratosDasSemanasAnteriores(historico, SEMANA, 2)).toEqual(new Set(["a", "b", "c"]));
    expect(pratosDasSemanasAnteriores(historico, SEMANA, 0)).toEqual(new Set());
  });
});

describe("analisarCardapio", () => {
  it("conta fritos e preparos e não alerta num dia dentro das regras", () => {
    const [dia] = analisar([
      item(DIAS[0], "arroz", "arroz"),
      item(DIAS[0], "batata", "batata-frita"),
      item(DIAS[0], "carne", "carne-1"), // forno
      item(DIAS[0], "sobras", null),
    ]);
    expect(dia.fritos).toBe(1);
    expect(dia.porPreparo).toMatchObject({ PANELA: 1, FRITADEIRA: 1, FORNO: 1 });
    expect(dia.alertas).toEqual([]);
  });

  it("alerta quando passa do limite de fritos (contando os fixos)", () => {
    const [dia] = analisar(
      [
        item(DIAS[0], "batata", "batata-frita"),
        item(DIAS[0], "pastel", "pastel"),
        item(DIAS[0], "carne", "carne-3"), // fritadeira
      ],
      [],
      { ...REGRAS, maxFritosDia: 2 },
    );
    expect(dia.fritos).toBe(3);
    expect(tipos(dia)).toEqual(["limite_fritos"]);
  });

  it("alerta repetição no dia seguinte em posição livre ou variável, mas não em fixa", () => {
    const [, segundo] = analisar([
      item(DIAS[0], "arroz", "arroz"),
      item(DIAS[0], "feijao", "lentilha"),
      item(DIAS[0], "carne", "carne-1"),
      item(DIAS[1], "arroz", "arroz"),
      item(DIAS[1], "feijao", "lentilha"),
      item(DIAS[1], "carne", "carne-1"),
    ]);
    expect(tipos(segundo)).toEqual(["repetiu_dia_anterior", "repetiu_dia_anterior"]);
  });

  it("não alerta repetição em dias seguidos se a regra estiver desligada", () => {
    const [, segundo] = analisar(
      [item(DIAS[0], "carne", "carne-1"), item(DIAS[1], "carne", "carne-1")],
      [],
      { ...REGRAS, naoRepetirDiasSeguidos: false },
    );
    expect(segundo.alertas).toEqual([]);
  });

  it("alerta prato livre servido na semana anterior", () => {
    const [dia] = analisar(
      [item(DIAS[0], "carne", "carne-1"), item(DIAS[0], "feijao", "lentilha")],
      [
        { data: "2026-11-08", pratoId: "carne-1" },
        { data: "2026-11-08", pratoId: "lentilha" },
      ],
    );
    expect(tipos(dia)).toEqual(["repetiu_semana_anterior"]);
    expect(dia.alertas[0].mensagem).toContain("semana anterior");
  });

  it("alerta posição vazia (exceto sobras), prato inativo e prato duplicado no dia", () => {
    const [dia] = analisar([
      item(DIAS[0], "massa", "massa-inativa"),
      item(DIAS[0], "carne", null),
      item(DIAS[0], "sobras", null),
      item(DIAS[0], "peixe", "massa-inativa"),
    ]);
    expect(tipos(dia)).toEqual([
      "prato_inativo",
      "posicao_vazia",
      "prato_inativo",
      "repetiu_no_dia",
    ]);
  });
});
