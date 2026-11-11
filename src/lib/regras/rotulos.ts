import {
  Area,
  TipoPosicao,
  type Area as TArea,
  type TipoPosicao as TTipoPosicao,
} from "@/generated/prisma/enums";

export { Area, TipoPosicao };

export const ROTULO_AREA: Record<TArea, string> = {
  CUBA: "Cuba",
  RECHAUD: "Rechaud",
  GRELHA: "Grelha",
};

export const ROTULO_AREA_PLURAL: Record<TArea, string> = {
  CUBA: "Cubas",
  RECHAUD: "Rechauds",
  GRELHA: "Grelha",
};

export const ROTULO_TIPO_POSICAO: Record<TTipoPosicao, string> = {
  FIXA: "Fixa",
  VARIAVEL: "Fixa com variação",
  LIVRE: "Livre por categoria",
  SOBRAS: "Sobras",
};

export const DESCRICAO_TIPO_POSICAO: Record<TTipoPosicao, string> = {
  FIXA: "Sempre o mesmo prato (ex.: arroz, farofa).",
  VARIAVEL: "Sempre existe, alternando entre os pratos escolhidos (ex.: feijão, polenta).",
  LIVRE: "O gerador escolhe um prato ativo da categoria (ex.: massa, carne).",
  SOBRAS: "Reservada para reaproveitamento; você preenche à mão.",
};

/** Dias na ordem do restaurante: terça a segunda. */
export const DIAS_ORDENADOS = [2, 3, 4, 5, 6, 0, 1];

export const DIA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** "Todos os dias" ou a lista curta ("Sáb, Dom") dos dias em que a posição existe. */
export function resumoDias(dias: number[], diasFuncionamento: number[]): string {
  const efetivos = diasFuncionamento.filter((d) => dias.length === 0 || dias.includes(d));
  if (efetivos.length === 0) return "Nenhum dia de funcionamento";
  if (efetivos.length === diasFuncionamento.length) return "Todos os dias";
  return DIAS_ORDENADOS.filter((d) => efetivos.includes(d))
    .map((d) => DIA_CURTO[d])
    .join(", ");
}
