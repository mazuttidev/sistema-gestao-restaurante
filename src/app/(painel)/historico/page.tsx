import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, ChevronRight, PencilLine } from "lucide-react";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { verificarSessao } from "@/lib/auth/dal";
import { diaMes, diasDaSemana } from "@/lib/gerador/datas";
import { obterConfiguracao } from "@/lib/regras/dados";
import { listarCardapios } from "@/lib/semana/dados";

export const metadata: Metadata = { title: "Histórico" };

export default async function PaginaHistorico() {
  await verificarSessao();
  const [cardapios, { diasFuncionamento }] = await Promise.all([
    listarCardapios(),
    obterConfiguracao(),
  ]);

  return (
    <>
      <CabecalhoPagina titulo="Histórico" descricao="Semanas anteriores e o que foi servido." />

      {cardapios.length === 0 ? (
        <div className="cartao text-suave p-8 text-center">
          <p className="text-texto font-bold">Nenhum cardápio ainda.</p>
          <p className="mt-1">Os cardápios gerados em Semana aparecem aqui.</p>
        </div>
      ) : (
        <ul className="cartao divide-borda divide-y">
          {cardapios.map((cardapio) => {
            const dias = diasDaSemana(cardapio.semanaInicio, diasFuncionamento);
            const ano = cardapio.semanaInicio.slice(0, 4);
            const periodo = dias.length
              ? `${diaMes(dias[0])} a ${diaMes(dias[dias.length - 1])}/${ano}`
              : `Semana de ${diaMes(cardapio.semanaInicio)}/${ano}`;
            const homologado = cardapio.status === "HOMOLOGADO";
            return (
              <li key={cardapio.id}>
                <Link
                  href={`/semana?inicio=${cardapio.semanaInicio}`}
                  className="hover:bg-fundo flex min-h-14 items-center gap-3 px-4 py-3"
                >
                  {homologado ? (
                    <CalendarCheck aria-hidden className="text-ok size-6 shrink-0" />
                  ) : (
                    <PencilLine aria-hidden className="text-alerta size-6 shrink-0" />
                  )}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-semibold">{periodo}</span>
                    <span className="text-suave text-sm">
                      {homologado ? "Homologado" : "Rascunho"} · {cardapio.pratosServidos} pratos
                    </span>
                  </span>
                  <ChevronRight aria-hidden className="text-suave size-5 shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
