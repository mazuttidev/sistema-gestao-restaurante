import { describe, expect, it } from "vitest";
import { POSICOES, PRATOS } from "../../../prisma/dados-iniciais";
import { normalizarNome } from "../texto";
import { criarAleatorio } from "./aleatorio";
import { gerarCardapio, posicaoExisteNoDia } from "./gerador";
import type { PosicaoGerador, PratoGerador, RegrasGerador } from "./tipos";

const pratos: PratoGerador[] = PRATOS.map((prato) => ({
  ...prato,
  id: normalizarNome(prato.nome),
}));

const posicoes: PosicaoGerador[] = POSICOES.map((posicao) => ({
  ...posicao,
  id: `${posicao.area}-${posicao.ordem}`,
  categoria: posicao.categoria ?? null,
  dias: posicao.dias ?? [],
  ativa: true,
  opcoes: (posicao.opcoes ?? []).map(normalizarNome),
}));

const regras: RegrasGerador = {
  diasFuncionamento: [2, 3, 4, 5, 6, 0],
  maxFritosDia: 4,
  semanasSemRepetir: 1,
  naoRepetirDiasSeguidos: true,
};

const categoriasLivres = ["MASSA", "CARNE", "FRANGO", "PEIXE", "SUINO", "RISOTO", "LEGUME"];

describe("catálogo histórico", () => {
  it("contém somente nomes normalizados únicos", () => {
    expect(new Set(pratos.map((prato) => prato.id)).size).toBe(pratos.length);
  });

  it.each(categoriasLivres)("oferece 12 opções ativas sem fritura para %s", (categoria) => {
    const candidatos = pratos.filter(
      (prato) => prato.ativo && prato.categoria === categoria && prato.preparo !== "FRITADEIRA",
    );

    expect(candidatos.length).toBeGreaterThanOrEqual(12);
  });

  it.each(Array.from({ length: 40 }, (_, indice) => indice + 1))(
    "gera duas semanas completas sem repetir pratos livres, com semente %i",
    (semente) => {
      const entrada = { pratos, posicoes, regras };
      const primeira = gerarCardapio({
        ...entrada,
        semanaInicio: "2026-11-10",
        historico: [],
        aleatorio: criarAleatorio(semente),
      });
      const segunda = gerarCardapio({
        ...entrada,
        semanaInicio: "2026-11-17",
        historico: primeira.itens.flatMap((item) =>
          item.pratoId ? [{ data: item.data, pratoId: item.pratoId }] : [],
        ),
        aleatorio: criarAleatorio(semente + 40),
      });

      for (const semana of [primeira, segunda]) {
        expect(semana.dias).toHaveLength(6);
        expect(semana.alertas).toEqual([]);
        for (const dia of semana.resumo) expect(dia.fritos).toBeLessThanOrEqual(4);

        for (const data of semana.dias) {
          for (const posicao of posicoes.filter((item) => posicaoExisteNoDia(item, data))) {
            const item = semana.itens.find(
              (gerado) => gerado.data === data && gerado.posicaoId === posicao.id,
            );
            expect(item).toBeDefined();
            if (posicao.tipo === "SOBRAS") expect(item?.pratoId).toBeNull();
            else expect(item?.pratoId).toBeTruthy();
            if (posicao.tipo === "FIXA") expect(item?.pratoId).toBe(posicao.opcoes[0]);
          }
        }
      }

      const itens = [...primeira.itens, ...segunda.itens];
      for (const posicao of posicoes.filter((item) => item.tipo === "LIVRE")) {
        const escolhidos = itens.filter((item) => item.posicaoId === posicao.id);
        expect(escolhidos).toHaveLength(12);
        expect(new Set(escolhidos.map((item) => item.pratoId)).size).toBe(12);
      }
    },
  );
});
