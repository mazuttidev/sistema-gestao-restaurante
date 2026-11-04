import "server-only";
import { cookies } from "next/headers";
import { COOKIE_SESSAO, DURACAO_SESSAO_SEGUNDOS, segredoSessao } from "./config";
import { assinarToken, verificarToken, type DadosSessao } from "./token";

export async function criarSessao(usuarioId: string): Promise<void> {
  const token = await assinarToken({ usuarioId }, segredoSessao(), DURACAO_SESSAO_SEGUNDOS);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_SESSAO_SEGUNDOS,
  });
}

export async function lerSessao(): Promise<DadosSessao | null> {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  return verificarToken(token, segredoSessao());
}

export async function encerrarSessao(): Promise<void> {
  (await cookies()).delete(COOKIE_SESSAO);
}
