import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";
import { lerSessao } from "@/lib/auth/sessao";
import { prisma } from "@/lib/prisma";
import { FormLogin } from "./form-login";

export const metadata: Metadata = { title: "Entrar" };

export default async function PaginaLogin() {
  // Quem já está logado (e ainda existe no banco) vai direto para o painel.
  const sessao = await lerSessao();
  if (sessao && (await prisma.usuario.count({ where: { id: sessao.usuarioId } }))) redirect("/");

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="cartao w-full max-w-sm p-8">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="bg-primaria flex size-12 items-center justify-center rounded-full text-white">
            <UtensilsCrossed aria-hidden className="size-6" />
          </span>
          <h1 className="text-2xl font-extrabold">Cardápio Certo</h1>
          <p className="text-suave text-sm">Restaurante Botafogo</p>
        </div>
        <FormLogin />
      </div>
    </main>
  );
}
