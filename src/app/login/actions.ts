"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { gerarHashSenha, verificarSenha } from "@/lib/auth/senha";
import { criarSessao, encerrarSessao } from "@/lib/auth/sessao";
import { prisma } from "@/lib/prisma";

export type EstadoLogin = { erro: string; email: string } | undefined;

const esquemaLogin = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido.")),
  senha: z.string().min(1, "Informe a senha."),
});

// Hash descartável para comparar quando o e-mail não existe, sem revelar isso pelo tempo de resposta.
let hashFalso: Promise<string> | undefined;

export async function entrar(_estado: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "");
  const dados = esquemaLogin.safeParse({ email, senha: formData.get("senha") ?? "" });
  if (!dados.success) return { erro: dados.error.issues[0].message, email };

  const usuario = await prisma.usuario.findUnique({ where: { email: dados.data.email } });
  hashFalso ??= gerarHashSenha("senha-inexistente");
  const senhaOk = await verificarSenha(dados.data.senha, usuario?.senhaHash ?? (await hashFalso));
  if (!usuario || !senhaOk) return { erro: "E-mail ou senha incorretos.", email };

  await criarSessao(usuario.id);
  redirect("/");
}

export async function sair(): Promise<void> {
  await encerrarSessao();
  redirect("/login");
}
