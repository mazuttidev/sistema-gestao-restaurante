import { SignJWT, jwtVerify } from "jose";

export type DadosSessao = { usuarioId: string };

function chave(segredo: string) {
  return new TextEncoder().encode(segredo);
}

/** Assina um JWT (HS256) com o id do usuário, válido por `segundos`. */
export async function assinarToken(
  dados: DadosSessao,
  segredo: string,
  segundos: number,
): Promise<string> {
  return new SignJWT({ usuarioId: dados.usuarioId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + segundos)
    .sign(chave(segredo));
}

/** Devolve os dados da sessão ou `null` se o token faltar, for inválido ou estiver expirado. */
export async function verificarToken(
  token: string | undefined,
  segredo: string,
): Promise<DadosSessao | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chave(segredo), { algorithms: ["HS256"] });
    return typeof payload.usuarioId === "string" ? { usuarioId: payload.usuarioId } : null;
  } catch {
    return null;
  }
}
