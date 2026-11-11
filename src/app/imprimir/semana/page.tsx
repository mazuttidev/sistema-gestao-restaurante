import type { Metadata } from "next";
import Link from "next/link";
import { verificarSessao } from "@/lib/auth/dal";
import { MENSAGEM_ERRO_EXPORTACAO, obterSemanaHomologada } from "@/lib/exportacao/dados";
import { ordemPosicao } from "@/lib/gerador/analise";
import { diaMes, ehDataISO, nomeDoDia } from "@/lib/gerador/datas";
import { BotaoImprimir } from "./botao-imprimir";

export const metadata: Metadata = { title: "Imprimir semana" };

/** Cardápio semanal homologado para imprimir em A4 deitado e levar para a cozinha (RF13). */
export default async function PaginaImprimirSemana({
  searchParams,
}: PageProps<"/imprimir/semana">) {
  await verificarSessao();
  const { inicio } = await searchParams;
  if (!ehDataISO(inicio)) return <Erro mensagem="Semana inválida." />;

  const resultado = await obterSemanaHomologada(inicio);
  if (!resultado.ok) return <Erro mensagem={MENSAGEM_ERRO_EXPORTACAO[resultado.erro]} />;

  const { semana } = resultado;
  const { dias } = semana;
  const nomes = new Map(semana.pratos.map((p) => [p.id, p.nome]));
  const itens = semana.cardapio!.itens;
  const item = (data: string, posicaoId: string) =>
    itens.find((i) => i.data === data && i.posicaoId === posicaoId);
  const posicoes = semana.posicoes
    .filter((p) => itens.some((i) => i.posicaoId === p.id))
    .sort((a, b) => ordemPosicao(a) - ordemPosicao(b));
  const ano = semana.semanaInicio.slice(0, 4);

  return (
    <main className="min-h-dvh bg-white p-6 text-black print:p-0">
      <style>{"@page { size: A4 landscape; margin: 10mm; }"}</style>

      <div className="mb-4 flex items-center justify-between gap-4 print:hidden">
        <Link href={`/semana?inicio=${semana.semanaInicio}`} className="botao-secundario">
          Voltar
        </Link>
        <BotaoImprimir />
      </div>

      <header className="mb-3 flex items-baseline justify-between">
        <h1 className="text-xl font-extrabold">Cardápio da semana — Restaurante Botafogo</h1>
        <p className="text-sm">
          {diaMes(dias[0])} a {diaMes(dias[dias.length - 1])}/{ano}
        </p>
      </header>

      <table className="w-full table-fixed border-collapse text-[11px] leading-tight">
        <thead>
          <tr>
            <th className="w-24 border border-black p-1 text-left">Posição</th>
            {dias.map((data) => (
              <th key={data} className="border border-black p-1 text-left">
                {nomeDoDia(data)} {diaMes(data)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posicoes.map((posicao) => (
            <tr key={posicao.id} className="break-inside-avoid">
              <th scope="row" className="border border-black p-1 text-left font-semibold">
                {posicao.nome}
              </th>
              {dias.map((data) => {
                const atual = item(data, posicao.id);
                return (
                  <td key={data} className="border border-black p-1 align-top">
                    {atual ? (atual.pratoId ? nomes.get(atual.pratoId) : "") : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

function Erro({ mensagem }: { mensagem: string }) {
  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <p className="font-bold">{mensagem}</p>
      <Link href="/semana" className="botao-secundario mt-4">
        Voltar para a semana
      </Link>
    </main>
  );
}
