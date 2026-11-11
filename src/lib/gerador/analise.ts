import type { MetodoPreparo } from "@/generated/prisma/enums";
import { somarDias, type DataISO } from "./datas";
import type {
  Alerta,
  ItemGerado,
  ItemHistorico,
  PosicaoGerador,
  PratoGerador,
  RegrasGerador,
} from "./tipos";

// Verifica as regras de negócio num cardápio (gerado ou ajustado à mão).
// Usada pelo gerador para sinalizar o que não conseguiu cumprir, pela grade da semana
// (indicadores por dia, RF08) e pelos alertas do ajuste manual (RF10).
//
// Quais posições entram em cada regra:
// - FIXA: o mesmo prato todo dia por definição; nunca conta como repetição.
// - VARIAVEL: poucas opções (ex.: 5 feijões para 6 dias); só não pode repetir no dia seguinte.
// - LIVRE: não repete no dia seguinte nem nas últimas N semanas (RN08).
// - SOBRAS: reaproveitamento; não entra na regra de repetição.

export type ResumoDia = {
  data: DataISO;
  fritos: number;
  porPreparo: Record<MetodoPreparo, number>;
  alertas: Alerta[];
};

export type EntradaAnalise = {
  semanaInicio: DataISO;
  dias: DataISO[];
  itens: ItemGerado[];
  pratos: Map<string, PratoGerador>;
  posicoes: Map<string, PosicaoGerador>;
  regras: RegrasGerador;
  historico: ItemHistorico[];
};

export function contagemVazia(): Record<MetodoPreparo, number> {
  return { FORNO: 0, GRELHA: 0, FRITADEIRA: 0, PANELA: 0, NENHUM: 0 };
}

/** Pratos servidos nas últimas `semanas` semanas antes de `semanaInicio`. */
export function pratosDasSemanasAnteriores(
  historico: ItemHistorico[],
  semanaInicio: DataISO,
  semanas: number,
): Set<string> {
  if (semanas <= 0) return new Set();
  const desde = somarDias(semanaInicio, -7 * semanas);
  return new Set(
    historico.filter((h) => h.data >= desde && h.data < semanaInicio).map((h) => h.pratoId),
  );
}

const PESO_AREA = { CUBA: 0, RECHAUD: 100, GRELHA: 200 } as const;

/** Ordem de exibição: cubas, rechauds e grelha, cada área pela ordem da posição. */
export function ordemPosicao(posicao: Pick<PosicaoGerador, "area" | "ordem"> | undefined): number {
  return posicao ? PESO_AREA[posicao.area] + posicao.ordem : Number.MAX_SAFE_INTEGER;
}

export function analisarCardapio(entrada: EntradaAnalise): ResumoDia[] {
  const { dias, itens, pratos, posicoes, regras } = entrada;
  const anteriores = pratosDasSemanasAnteriores(
    entrada.historico,
    entrada.semanaInicio,
    regras.semanasSemRepetir,
  );

  const pratosPorDia = new Map<DataISO, Set<string>>();
  for (const item of itens) {
    if (!item.pratoId) continue;
    const conjunto = pratosPorDia.get(item.data) ?? new Set<string>();
    conjunto.add(item.pratoId);
    pratosPorDia.set(item.data, conjunto);
  }

  return dias.map((data, indice) => {
    const doDia = itens
      .filter((i) => i.data === data)
      .sort(
        (a, b) => ordemPosicao(posicoes.get(a.posicaoId)) - ordemPosicao(posicoes.get(b.posicaoId)),
      );
    const diaAnterior = indice > 0 ? pratosPorDia.get(dias[indice - 1]) : undefined;
    const porPreparo = contagemVazia();
    const alertas: Alerta[] = [];
    const vistos = new Set<string>();

    for (const item of doDia) {
      const posicao = posicoes.get(item.posicaoId);
      if (!posicao) continue;

      if (!item.pratoId) {
        if (posicao.tipo !== "SOBRAS") {
          alertas.push({
            tipo: "posicao_vazia",
            data,
            posicaoId: posicao.id,
            mensagem: `${posicao.nome} está sem prato.`,
          });
        }
        continue;
      }

      const prato = pratos.get(item.pratoId);
      if (!prato) continue;
      porPreparo[prato.preparo]++;

      if (!prato.ativo) {
        alertas.push({
          tipo: "prato_inativo",
          data,
          posicaoId: posicao.id,
          mensagem: `${prato.nome} está inativo no cadastro.`,
        });
      }

      if (vistos.has(prato.id)) {
        alertas.push({
          tipo: "repetiu_no_dia",
          data,
          posicaoId: posicao.id,
          mensagem: `${prato.nome} aparece mais de uma vez no dia.`,
        });
      }
      vistos.add(prato.id);

      const contaRepeticao = posicao.tipo === "LIVRE" || posicao.tipo === "VARIAVEL";
      if (contaRepeticao && regras.naoRepetirDiasSeguidos && diaAnterior?.has(prato.id)) {
        alertas.push({
          tipo: "repetiu_dia_anterior",
          data,
          posicaoId: posicao.id,
          mensagem: `${prato.nome} também foi servido no dia anterior.`,
        });
      }
      if (posicao.tipo === "LIVRE" && anteriores.has(prato.id)) {
        alertas.push({
          tipo: "repetiu_semana_anterior",
          data,
          posicaoId: posicao.id,
          mensagem: `${prato.nome} foi servido ${
            regras.semanasSemRepetir === 1
              ? "na semana anterior"
              : `nas últimas ${regras.semanasSemRepetir} semanas`
          }.`,
        });
      }
    }

    const fritos = porPreparo.FRITADEIRA;
    if (fritos > regras.maxFritosDia) {
      alertas.unshift({
        tipo: "limite_fritos",
        data,
        mensagem: `${fritos} fritos no dia (limite: ${regras.maxFritosDia}).`,
      });
    }

    return { data, fritos, porPreparo, alertas };
  });
}
