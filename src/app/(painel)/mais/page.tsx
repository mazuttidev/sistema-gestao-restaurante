import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, History, LogOut, SlidersHorizontal } from "lucide-react";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { obterUsuarioAtual } from "@/lib/auth/dal";
import { sair } from "../../login/actions";

export const metadata: Metadata = { title: "Mais" };

const LINKS = [
  { href: "/regras", rotulo: "Regras e estrutura do buffet", Icone: SlidersHorizontal },
  { href: "/historico", rotulo: "Histórico", Icone: History },
];

export default async function PaginaMais() {
  const usuario = await obterUsuarioAtual();

  return (
    <>
      <CabecalhoPagina titulo="Mais" />
      <ul className="cartao divide-borda divide-y">
        {LINKS.map(({ href, rotulo, Icone }) => (
          <li key={href}>
            <Link href={href} className="flex min-h-14 items-center gap-3 px-4 font-semibold">
              <Icone aria-hidden className="text-primaria size-5" />
              <span className="flex-1">{rotulo}</span>
              <ChevronRight aria-hidden className="text-suave size-5" />
            </Link>
          </li>
        ))}
      </ul>

      <section className="cartao mt-6 p-4">
        <h2 className="font-bold">Conta</h2>
        <p className="text-suave mt-1">
          {usuario.nome} · {usuario.email}
        </p>
        <form action={sair} className="mt-4">
          <button type="submit" className="botao-secundario w-full">
            <LogOut aria-hidden className="size-5" />
            Sair
          </button>
        </form>
      </section>
    </>
  );
}
