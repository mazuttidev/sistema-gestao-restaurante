// Datas do cardápio como texto "AAAA-MM-DD", sempre em UTC.
// Evita que o fuso do servidor mude o dia (colunas @db.Date chegam como meia-noite UTC).

export type DataISO = string;

const UM_DIA_MS = 24 * 60 * 60 * 1000;

export function paraDataISO(data: Date): DataISO {
  return data.toISOString().slice(0, 10);
}

export function deDataISO(data: DataISO): Date {
  return new Date(`${data}T00:00:00.000Z`);
}

export function somarDias(data: DataISO, dias: number): DataISO {
  return paraDataISO(new Date(deDataISO(data).getTime() + dias * UM_DIA_MS));
}

/** Dia da semana (0 = domingo … 6 = sábado), mesmo padrão de `Date.getDay()`. */
export function diaDaSemana(data: DataISO): number {
  return deDataISO(data).getUTCDay();
}

/** Posição do dia numa semana que começa na segunda (segunda = 1 … domingo = 7). */
function ordemNaSemana(dia: number): number {
  return dia === 0 ? 7 : dia;
}

/**
 * Dia da semana em que o cardápio começa: o primeiro dia de funcionamento contando a partir
 * da segunda. Terça a domingo (padrão) começa na terça; segunda a sábado, na segunda.
 */
export function diaInicialDaSemana(diasFuncionamento: number[]): number {
  if (diasFuncionamento.length === 0) return 1;
  return diasFuncionamento.reduce((a, b) => (ordemNaSemana(b) < ordemNaSemana(a) ? b : a));
}

/** Data de início da semana do cardápio que contém `data` (ou a última que começou antes dela). */
export function inicioDaSemana(data: DataISO, diasFuncionamento: number[]): DataISO {
  const atual = diaDaSemana(data);
  const alvo = diaInicialDaSemana(diasFuncionamento);
  return somarDias(data, -((atual - alvo + 7) % 7));
}

/**
 * Semana que o gestor quer ver ao abrir o painel: a semana em curso, ou a próxima quando
 * hoje é dia de folga (ex.: na segunda, com o restaurante fechado, ele planeja a semana
 * que começa na terça).
 */
export function semanaPadrao(hoje: DataISO, diasFuncionamento: number[]): DataISO {
  const atual = inicioDaSemana(hoje, diasFuncionamento);
  return diasFuncionamento.includes(diaDaSemana(hoje)) ? atual : somarDias(atual, 7);
}

/** Data de hoje no fuso do restaurante. */
export function hojeNoRestaurante(agora = new Date()): DataISO {
  // en-CA formata como AAAA-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora);
}

/** Aceita só datas válidas no formato AAAA-MM-DD. */
export function ehDataISO(valor: unknown): valor is DataISO {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const data = deDataISO(valor);
  return !Number.isNaN(data.getTime()) && paraDataISO(data) === valor;
}

/** Dias de funcionamento da semana que começa em `semanaInicio`, em ordem. */
export function diasDaSemana(semanaInicio: DataISO, diasFuncionamento: number[]): DataISO[] {
  const dias: DataISO[] = [];
  for (let i = 0; i < 7; i++) {
    const data = somarDias(semanaInicio, i);
    if (diasFuncionamento.includes(diaDaSemana(data))) dias.push(data);
  }
  return dias;
}

export const NOMES_DIAS_SEMANA = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export function nomeDoDia(data: DataISO): string {
  return NOMES_DIAS_SEMANA[diaDaSemana(data)];
}

/** "12/11" a partir de "2026-11-12". */
export function diaMes(data: DataISO): string {
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}
