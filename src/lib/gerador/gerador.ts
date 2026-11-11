import type { MetodoPreparo } from "@/generated/prisma/enums";
import { embaralhar, sortearComPeso, type Aleatorio } from "./aleatorio";
import {
  analisarCardapio,
  contagemVazia,
  ordemPosicao,
  pratosDasSemanasAnteriores,
  type ResumoDia,
} from "./analise";
import { diaDaSemana, diasDaSemana, type DataISO } from "./datas";
import type {
  Alerta,
  ItemGerado,
  ItemHistorico,
  PosicaoGerador,
  PratoGerador,
  RegrasGerador,
} from "./tipos";

// Gerador do cardápio semanal (RF07). Função pura: recebe pratos, posições, regras,
// histórico e itens atuais; devolve os itens da semana e os alertas de regra.
//
// Para cada dia de funcionamento, na ordem:
// 1. Mantém os itens travados (e, ao regenerar só alguns dias, os itens dos outros dias).
// 2. Preenche posições FIXA com a opção cadastrada e deixa SOBRAS vazias.
// 3. Escolhe VARIAVEL (entre as opções) e LIVRE (pratos ativos da categoria), em ordem
//    sorteada, dando a cada candidato uma penalidade:
//      - estoura o limite de fritos do dia (RN06) ............. 1000
//      - repete o dia anterior ou o seguinte (RN08) ............. 100
//      - foi servido nas semanas anteriores (RN08, só LIVRE) ...... 10
//      - já saiu nesta semana (por vez) ......... 5 (LIVRE) ou 1 (VARIAVEL)
//    Sorteia entre os de menor penalidade, com peso maior para o método de preparo menos
//    usado no dia entre forno, grelha e fritadeira (RN05).
// 4. Se só sobrar candidato que fere uma regra, usa o "menos pior" e a análise final
//    sinaliza o dia (relaxamento controlado). Sem candidato algum, a posição fica vazia.

export type EntradaGerador = {
  semanaInicio: DataISO;
  pratos: PratoGerador[];
  posicoes: PosicaoGerador[];
  regras: RegrasGerador;
  /** Pratos servidos em semanas anteriores. */
  historico: ItemHistorico[];
  /** Itens atuais do cardápio; os travados nunca são trocados. */
  atuais?: ItemGerado[];
  /** Regenera só estes dias e mantém os outros como estão. Omitido: a semana toda. */
  apenasDias?: DataISO[];
  aleatorio?: Aleatorio;
};

export type ResultadoGerador = {
  dias: DataISO[];
  itens: ItemGerado[];
  resumo: ResumoDia[];
  alertas: Alerta[];
};

const PENALIDADE = {
  limiteFritos: 1000,
  diaVizinho: 100,
  semanaAnterior: 10,
  usoNaSemanaLivre: 5,
  usoNaSemanaVariavel: 1,
} as const;

const METODOS_EQUILIBRADOS: MetodoPreparo[] = ["FORNO", "GRELHA", "FRITADEIRA"];

const chave = (data: DataISO, posicaoId: string) => `${data}|${posicaoId}`;

export function posicaoExisteNoDia(posicao: PosicaoGerador, data: DataISO): boolean {
  return posicao.ativa && (posicao.dias.length === 0 || posicao.dias.includes(diaDaSemana(data)));
}

/** Pratos ativos que podem ocupar a posição. */
export function candidatosDaPosicao(
  posicao: PosicaoGerador,
  pratos: PratoGerador[],
): PratoGerador[] {
  if (posicao.tipo === "VARIAVEL" || posicao.tipo === "FIXA") {
    return pratos.filter((p) => p.ativo && posicao.opcoes.includes(p.id));
  }
  if (posicao.tipo === "LIVRE") {
    return pratos.filter((p) => p.ativo && p.categoria === posicao.categoria);
  }
  return [];
}

export function gerarCardapio(entrada: EntradaGerador): ResultadoGerador {
  const { semanaInicio, regras } = entrada;
  const aleatorio = entrada.aleatorio ?? Math.random;
  const dias = diasDaSemana(semanaInicio, regras.diasFuncionamento);
  const pratos = new Map(entrada.pratos.map((p) => [p.id, p]));
  const posicoes = new Map(entrada.posicoes.map((p) => [p.id, p]));
  const ordenadas = [...entrada.posicoes].sort((a, b) => ordemPosicao(a) - ordemPosicao(b));
  const anteriores = pratosDasSemanasAnteriores(
    entrada.historico,
    semanaInicio,
    regras.semanasSemRepetir,
  );

  // Itens que não serão trocados.
  const mantidos = new Map<string, ItemGerado>();
  for (const item of entrada.atuais ?? []) {
    const posicao = posicoes.get(item.posicaoId);
    if (!posicao || !dias.includes(item.data) || !posicaoExisteNoDia(posicao, item.data)) continue;
    const foraDoRegenerado = entrada.apenasDias && !entrada.apenasDias.includes(item.data);
    if (item.travado || foraDoRegenerado) mantidos.set(chave(item.data, item.posicaoId), item);
  }

  const pratosPorDia = new Map<DataISO, Set<string>>(dias.map((d) => [d, new Set()]));
  const usoNaSemana = new Map<string, number>();
  const registrarUso = (data: DataISO, pratoId: string | null) => {
    if (!pratoId) return;
    pratosPorDia.get(data)?.add(pratoId);
    usoNaSemana.set(pratoId, (usoNaSemana.get(pratoId) ?? 0) + 1);
  };
  for (const item of mantidos.values()) registrarUso(item.data, item.pratoId);

  const itens: ItemGerado[] = [];

  dias.forEach((data, indice) => {
    const doDia = ordenadas.filter((p) => posicaoExisteNoDia(p, data));
    const porPreparo = contagemVazia();
    for (const item of mantidos.values()) {
      const prato = item.data === data && item.pratoId ? pratos.get(item.pratoId) : undefined;
      if (prato) porPreparo[prato.preparo]++;
    }
    const vizinhos = [dias[indice - 1], dias[indice + 1]].filter(Boolean);
    const escolhidos = new Map<string, string | null>();

    const definir = (posicao: PosicaoGerador, pratoId: string | null) => {
      escolhidos.set(posicao.id, pratoId);
      registrarUso(data, pratoId);
      const prato = pratoId ? pratos.get(pratoId) : undefined;
      if (prato) porPreparo[prato.preparo]++;
    };

    const pendentes: PosicaoGerador[] = [];
    for (const posicao of doDia) {
      if (mantidos.has(chave(data, posicao.id))) continue;
      if (posicao.tipo === "FIXA") definir(posicao, posicao.opcoes[0] ?? null);
      else if (posicao.tipo === "SOBRAS") definir(posicao, null);
      else pendentes.push(posicao);
    }

    // Variáveis primeiro (menos opções); a ordem entre posições é sorteada para que
    // o limite de fritos não pese sempre sobre a mesma posição.
    const ordemDeEscolha = [
      ...embaralhar(
        pendentes.filter((p) => p.tipo === "VARIAVEL"),
        aleatorio,
      ),
      ...embaralhar(
        pendentes.filter((p) => p.tipo === "LIVRE"),
        aleatorio,
      ),
    ];

    for (const posicao of ordemDeEscolha) {
      const noDia = pratosPorDia.get(data)!;
      const candidatos = candidatosDaPosicao(posicao, entrada.pratos).filter(
        (p) => !noDia.has(p.id),
      );
      if (candidatos.length === 0) {
        definir(posicao, null);
        continue;
      }

      const livre = posicao.tipo === "LIVRE";
      const penalidade = (prato: PratoGerador) => {
        let total = 0;
        if (prato.preparo === "FRITADEIRA" && porPreparo.FRITADEIRA >= regras.maxFritosDia) {
          total += PENALIDADE.limiteFritos;
        }
        if (
          regras.naoRepetirDiasSeguidos &&
          vizinhos.some((d) => pratosPorDia.get(d)?.has(prato.id))
        ) {
          total += PENALIDADE.diaVizinho;
        }
        if (livre && anteriores.has(prato.id)) total += PENALIDADE.semanaAnterior;
        const usos = usoNaSemana.get(prato.id) ?? 0;
        total += usos * (livre ? PENALIDADE.usoNaSemanaLivre : PENALIDADE.usoNaSemanaVariavel);
        return total;
      };

      const avaliados = candidatos.map((prato) => ({ prato, valor: penalidade(prato) }));
      const menor = Math.min(...avaliados.map((c) => c.valor));
      const melhores = avaliados.filter((c) => c.valor === menor).map((c) => c.prato);
      const escolhido = sortearComPeso(
        melhores,
        (prato) =>
          METODOS_EQUILIBRADOS.includes(prato.preparo) ? 1 / (1 + porPreparo[prato.preparo]) : 1,
        aleatorio,
      );
      definir(posicao, escolhido.id);
    }

    for (const posicao of doDia) {
      itens.push(
        mantidos.get(chave(data, posicao.id)) ?? {
          data,
          posicaoId: posicao.id,
          pratoId: escolhidos.get(posicao.id) ?? null,
          travado: false,
        },
      );
    }
  });

  const resumo = analisarCardapio({
    semanaInicio,
    dias,
    itens,
    pratos,
    posicoes,
    regras,
    historico: entrada.historico,
  });
  return { dias, itens, resumo, alertas: resumo.flatMap((d) => d.alertas) };
}
