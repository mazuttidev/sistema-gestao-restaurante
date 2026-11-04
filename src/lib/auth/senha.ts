import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  senha: string,
  sal: Buffer,
  tamanho: number,
) => Promise<Buffer>;

const TAMANHO_CHAVE = 64;

/** Gera o hash no formato `scrypt$<sal>$<hash>` (base64). */
export async function gerarHashSenha(senha: string): Promise<string> {
  const sal = randomBytes(16);
  const hash = await scryptAsync(senha, sal, TAMANHO_CHAVE);
  return `scrypt$${sal.toString("base64")}$${hash.toString("base64")}`;
}

export async function verificarSenha(senha: string, armazenado: string): Promise<boolean> {
  const [algoritmo, salB64, hashB64] = armazenado.split("$");
  if (algoritmo !== "scrypt" || !salB64 || !hashB64) return false;

  const esperado = Buffer.from(hashB64, "base64");
  const calculado = await scryptAsync(senha, Buffer.from(salB64, "base64"), esperado.length);
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado);
}
