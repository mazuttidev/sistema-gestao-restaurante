import { describe, expect, it } from "vitest";
import { DIAS, POSICOES, PRATOS, REGRAS, SEMANA } from "./__testes__/cenario";
import { criarAleatorio } from "./aleatorio";
import { gerarCardapio, type EntradaGerador } from "./gerador";
import type { ItemGerado, PratoGerador } from "./tipos";

const SEMENTES = Array.from({ length: 40 }, (_, i) => i + 1);
const preparoDe = new Map(PRATOS.map((p) => [p.id, p.preparo]));

function gerar(extra: Partial<EntradaGerador> = {}, semente = 1) {
  return gerarCardapio({
    semanaInicio: SEMANA,
    pratos: PRATOS,
    posicoes: POSICOES,
    regras: REGRAS,
    historico: [],
    aleatorio: criarAleatorio(semente),
    ...extra,
  });
}

const pratoEm = (itens: ItemGerado[], data: string, posicaoId: string) =>
  itens.find((i) => i.data === data && i.posicaoId === posicaoId)?.pratoId;

const fritosNoDia = (itens: ItemGerado[], data: string) =>
  itens.filter((i) => i.data === data && i.pratoId && preparoDe.get(i.pratoId) === "FRITADEIRA")
    .length;

describe("gerarCardapio", () => {
  it("preenche todas as posições de todos os dias de funcionamento", () => {
    const { dias, itens, alertas } = gerar();
    expect(dias).toEqual(DIAS);
    for (const data of DIAS) {
      expect(pratoEm(itens, data, "arroz")).toBe("arroz");
      expect(pratoEm(itens, data, "sobras")).toBeNull();
      for (const posicao of ["feijao", "massa", "carne", "peixe"]) {
        expect(pratoEm(itens, data, posicao)).toBeTruthy();
      }
    }
    expect(alertas).toEqual([]);
  });

  it("respeita os dias da posição (churrasco só sábado e domingo)", () => {
    const { itens } = gerar();
    const dias = itens.filter((i) => i.posicaoId === "churrasco").map((i) => i.data);
    expect(dias).toEqual(["2026-11-14", "2026-11-15"]);
  });

  it("ignora posições inativas e nunca escolhe pratos inativos", () => {
    const posicoes = POSICOES.map((p) => (p.id === "peixe" ? { ...p, ativa: false } : p));
    for (const semente of SEMENTES) {
      const { itens } = gerar({ posicoes }, semente);
      expect(itens.some((i) => i.posicaoId === "peixe")).toBe(false);
      expect(itens.some((i) => i.pratoId === "massa-inativa")).toBe(false);
    }
  });

  it("gera o mesmo cardápio com a mesma semente", () => {
    expect(gerar({}, 7).itens).toEqual(gerar({}, 7).itens);
    expect(gerar({}, 7).itens).not.toEqual(gerar({}, 8).itens);
  });

  it("não passa do limite de fritos por dia, contando os fixos (RN06)", () => {
    const regras = { ...REGRAS, maxFritosDia: 3 }; // batata e pastel já são 2
    for (const semente of SEMENTES) {
      const { itens, alertas } = gerar({ regras }, semente);
      for (const data of DIAS) expect(fritosNoDia(itens, data)).toBeLessThanOrEqual(3);
      expect(alertas.filter((a) => a.tipo === "limite_fritos")).toEqual([]);
    }
  });

  it("sinaliza o dia quando os fixos sozinhos já passam do limite de fritos", () => {
    const { itens, alertas } = gerar({ regras: { ...REGRAS, maxFritosDia: 1 } });
    for (const data of DIAS) expect(fritosNoDia(itens, data)).toBe(2);
    expect(alertas.filter((a) => a.tipo === "limite_fritos")).toHaveLength(DIAS.length);
  });

  it("não repete prato livre ou variável em dias seguidos (RN08)", () => {
    for (const semente of SEMENTES) {
      const { itens } = gerar({}, semente);
      for (let d = 1; d < DIAS.length; d++) {
        const ontem = new Set(itens.filter((i) => i.data === DIAS[d - 1]).map((i) => i.pratoId));
        for (const posicao of ["feijao", "massa", "carne", "peixe"]) {
          expect(ontem.has(pratoEm(itens, DIAS[d], posicao)!)).toBe(false);
        }
      }
    }
  });

  it("não repete prato livre dentro da semana quando há opções suficientes", () => {
    const { itens } = gerar();
    for (const posicao of ["massa", "carne", "peixe"]) {
      const escolhidos = DIAS.map((d) => pratoEm(itens, d, posicao));
      expect(new Set(escolhidos).size).toBe(DIAS.length);
    }
  });

  it("evita pratos servidos na semana anterior (RN08)", () => {
    const servidas = Array.from({ length: 8 }, (_, i) => `carne-${i + 1}`);
    const historico = servidas.map((pratoId) => ({ data: "2026-11-08", pratoId }));
    for (const semente of SEMENTES) {
      const { itens } = gerar({ historico }, semente);
      const carnes = DIAS.map((d) => pratoEm(itens, d, "carne"));
      expect(carnes.filter((c) => servidas.includes(c!))).toEqual([]);
    }
  });

  it("relaxa a regra e sinaliza quando faltam pratos na categoria", () => {
    const pratos = PRATOS.filter((p) => p.categoria !== "MASSA" || p.id === "massa-1");
    const { itens, alertas } = gerar({ pratos });
    expect(DIAS.map((d) => pratoEm(itens, d, "massa"))).toEqual(DIAS.map(() => "massa-1"));
    expect(alertas.filter((a) => a.tipo === "repetiu_dia_anterior")).toHaveLength(DIAS.length - 1);
  });

  it("deixa a posição vazia e alerta quando não há prato ativo na categoria", () => {
    const pratos = PRATOS.filter((p) => p.categoria !== "PEIXE");
    const { itens, alertas } = gerar({ pratos });
    expect(pratoEm(itens, DIAS[0], "peixe")).toBeNull();
    expect(alertas.filter((a) => a.tipo === "posicao_vazia")).toHaveLength(DIAS.length);
  });

  it("mantém os itens travados ao regenerar (RF09)", () => {
    const atuais = gerar({}, 3).itens.map((i) =>
      i.data === DIAS[2] && i.posicaoId === "carne" ? { ...i, travado: true } : i,
    );
    const travado = pratoEm(atuais, DIAS[2], "carne");
    for (const semente of SEMENTES) {
      const { itens } = gerar({ atuais }, semente);
      expect(pratoEm(itens, DIAS[2], "carne")).toBe(travado);
      // O prato travado conta para a não repetição dos dias vizinhos.
      expect(pratoEm(itens, DIAS[1], "carne")).not.toBe(travado);
      expect(pratoEm(itens, DIAS[3], "carne")).not.toBe(travado);
    }
  });

  it("regenera só os dias pedidos e mantém os outros", () => {
    const atuais = gerar({}, 3).itens;
    const { itens } = gerar({ atuais, apenasDias: [DIAS[1]] }, 99);
    for (const data of DIAS.filter((d) => d !== DIAS[1])) {
      expect(itens.filter((i) => i.data === data)).toEqual(atuais.filter((i) => i.data === data));
    }
    expect(itens.filter((i) => i.data === DIAS[1])).not.toEqual(
      atuais.filter((i) => i.data === DIAS[1]),
    );
  });

  it("equilibra os métodos de preparo quando há empate (RN05)", () => {
    // Carne e peixe com um prato de forno e um de grelha cada: o dia não deve sair
    // com dois do mesmo método quando dá para usar os dois.
    const pratos: PratoGerador[] = [
      ...PRATOS.filter((p) => !["CARNE", "PEIXE"].includes(p.categoria)),
      { id: "carne-forno", nome: "", categoria: "CARNE", preparo: "FORNO", ativo: true },
      { id: "carne-grelha", nome: "", categoria: "CARNE", preparo: "GRELHA", ativo: true },
      { id: "peixe-forno", nome: "", categoria: "PEIXE", preparo: "FORNO", ativo: true },
      { id: "peixe-grelha", nome: "", categoria: "PEIXE", preparo: "GRELHA", ativo: true },
    ];
    const regras = { ...REGRAS, diasFuncionamento: [2] }; // um dia só: sem repetição
    let equilibrados = 0;
    for (const semente of SEMENTES) {
      const { itens } = gerar({ pratos, regras }, semente);
      const carne = pratoEm(itens, DIAS[0], "carne")!;
      const peixe = pratoEm(itens, DIAS[0], "peixe")!;
      if (carne.split("-")[1] !== peixe.split("-")[1]) equilibrados++;
    }
    // Sem o peso por método seria ~50%; com ele, a segunda escolha favorece o outro método.
    expect(equilibrados / SEMENTES.length).toBeGreaterThan(0.6);
  });

  it("gera uma semana com cadastro grande em menos de 3 s (RNF04)", () => {
    const pratos = Array.from({ length: 600 }, (_, i) => ({
      ...PRATOS[(i % (PRATOS.length - 1)) + 1],
      id: `p${i}`,
    }));
    const inicio = performance.now();
    gerar({ pratos });
    expect(performance.now() - inicio).toBeLessThan(3000);
  });
});
