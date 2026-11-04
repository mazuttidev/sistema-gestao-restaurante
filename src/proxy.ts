import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, segredoSessao } from "@/lib/auth/config";
import { verificarToken } from "@/lib/auth/token";

const ROTAS_PUBLICAS = ["/login"];

// Checagem otimista: só confere o cookie. A verificação definitiva acontece
// no servidor, em src/lib/auth/dal.ts.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (ROTAS_PUBLICAS.includes(pathname)) return NextResponse.next();

  const sessao = await verificarToken(request.cookies.get(COOKIE_SESSAO)?.value, segredoSessao());
  if (!sessao) return NextResponse.redirect(new URL("/login", request.nextUrl));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
