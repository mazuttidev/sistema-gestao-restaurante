import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { lerSessao } from "./sessao";

export type UsuarioAtual = { id: string; nome: string; email: string };

/**
 * Camada de acesso a dados da autenticação: toda página, server action e
 * route handler do painel chama uma destas funções antes de tocar nos dados.
 */
export const verificarSessao = cache(async () => {
  const sessao = await lerSessao();
  if (!sessao) redirect("/login");
  return sessao;
});

export const obterUsuarioAtual = cache(async (): Promise<UsuarioAtual> => {
  const { usuarioId } = await verificarSessao();
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, nome: true, email: true },
  });
  if (!usuario) redirect("/login");
  return usuario;
});
