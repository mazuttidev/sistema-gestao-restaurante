import type { Area, Categoria, MetodoPreparo, TipoPosicao } from "@/generated/prisma/enums";
import type { DataISO } from "./datas";

// Tipos de entrada e saída do gerador. Não dependem do Prisma em tempo de execução:
// o gerador é uma função pura, testável sem banco.

export type PratoGerador = {
  id: string;
  nome: string;
  categoria: Categoria;
  preparo: MetodoPreparo;
  ativo: boolean;
};

export type PosicaoGerador = {
  id: string;
  area: Area;
  ordem: number;
  nome: string;
  tipo: TipoPosicao;
  categoria: Categoria | null;
  /** Dias da semana (0–6) em que a posição existe. Vazio = todos. */
  dias: number[];
  ativa: boolean;
  /** Pratos permitidos (FIXA: um; VARIAVEL: vários). */
  opcoes: string[];
};

export type RegrasGerador = {
  diasFuncionamento: number[];
  maxFritosDia: number;
  semanasSemRepetir: number;
  naoRepetirDiasSeguidos: boolean;
};

export type ItemGerado = {
  data: DataISO;
  posicaoId: string;
  pratoId: string | null;
  travado: boolean;
};

/** Prato servido num cardápio anterior (para a regra de não repetição). */
export type ItemHistorico = { data: DataISO; pratoId: string };

export type TipoAlerta =
  | "limite_fritos"
  | "repetiu_dia_anterior"
  | "repetiu_semana_anterior"
  | "repetiu_no_dia"
  | "posicao_vazia"
  | "sem_candidato"
  | "prato_inativo";

export type Alerta = {
  tipo: TipoAlerta;
  data: DataISO;
  /** Posição afetada, quando o alerta é de um item. */
  posicaoId?: string;
  mensagem: string;
};
