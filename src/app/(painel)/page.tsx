import Link from "next/link";
import { CalendarDays, UtensilsCrossed } from "lucide-react";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { obterUsuarioAtual } from "@/lib/auth/dal";

function saudacao(hora: number) {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function PaginaInicio() {
  const usuario = await obterUsuarioAtual();
  const hora = Number(
    new Intl.DateTimeFormat("pt-BR", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "America/Sao_Paulo",
    }).format(new Date()),
  );
  const primeiroNome = usuario.nome.split(" ")[0];

  return (
    <>
      <CabecalhoPagina
        titulo={`${saudacao(hora)}, ${primeiroNome}`}
        descricao="O que você quer fazer hoje?"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/semana" className="cartao hover:border-primaria flex items-start gap-4 p-6">
          <CalendarDays aria-hidden className="text-primaria size-8 shrink-0" />
          <div>
            <h2 className="text-lg font-bold">Cardápio da semana</h2>
            <p className="text-suave">Gerar, ajustar e homologar a semana de terça a domingo.</p>
          </div>
        </Link>
        <Link href="/pratos" className="cartao hover:border-primaria flex items-start gap-4 p-6">
          <UtensilsCrossed aria-hidden className="text-primaria size-8 shrink-0" />
          <div>
            <h2 className="text-lg font-bold">Pratos</h2>
            <p className="text-suave">Cadastrar e organizar os pratos do buffet.</p>
          </div>
        </Link>
      </div>
    </>
  );
}
