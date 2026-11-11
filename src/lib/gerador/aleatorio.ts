/** Número aleatório em [0, 1). */
export type Aleatorio = () => number;

/** Gerador com semente (mulberry32): a mesma semente gera o mesmo cardápio, útil nos testes. */
export function criarAleatorio(semente: number): Aleatorio {
  let estado = semente >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sorteia um elemento com probabilidade proporcional ao peso. */
export function sortearComPeso<T>(itens: T[], peso: (item: T) => number, aleatorio: Aleatorio): T {
  const pesos = itens.map(peso);
  const total = pesos.reduce((a, b) => a + b, 0);
  let alvo = aleatorio() * total;
  for (let i = 0; i < itens.length; i++) {
    alvo -= pesos[i];
    if (alvo < 0) return itens[i];
  }
  return itens[itens.length - 1];
}

export function embaralhar<T>(itens: T[], aleatorio: Aleatorio): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
