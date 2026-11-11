import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import type { Area as TArea } from "@/generated/prisma/enums";
import { Aviso } from "@/components/painel/aviso";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { verificarSessao } from "@/lib/auth/dal";
import { ROTULO_CATEGORIA } from "@/lib/pratos/rotulos";
import { listarPosicoes, obterConfiguracao, type PosicaoDaLista } from "@/lib/regras/dados";
import {
  Area,
  ROTULO_AREA,
  ROTULO_AREA_PLURAL,
  ROTULO_TIPO_POSICAO,
  resumoDias,
} from "@/lib/regras/rotulos";
import { FormConfiguracao } from "./form-configuracao";

export const metadata: Metadata = { title: "Regras" };

function textoAviso(aviso: string | undefined, nome: string | undefined) {
  if (aviso === "posicao_salva") return `Posição “${nome ?? ""}” salva.`;
  if (aviso === "posicao_excluida") return "Posição excluída.";
  if (aviso === "posicao_desativada")
    return "Esta posição já foi usada em cardápios, então foi desativada em vez de excluída.";
}

export default async function PaginaRegras({ searchParams }: PageProps<"/regras">) {
  await verificarSessao();
  const parametros = await searchParams;
  const [configuracao, posicoes] = await Promise.all([obterConfiguracao(), listarPosicoes()]);
  const aviso = textoAviso(
    typeof parametros.aviso === "string" ? parametros.aviso : undefined,
    typeof parametros.nome === "string" ? parametros.nome : undefined,
  );

  return (
    <>
      <CabecalhoPagina
        titulo="Regras e estrutura do buffet"
        descricao="O que o gerador segue ao montar a semana."
      />

      {aviso && <Aviso>{aviso}</Aviso>}

      <div className="flex flex-col gap-8">
        <FormConfiguracao
          configuracao={{
            diasFuncionamento: configuracao.diasFuncionamento,
            maxFritosDia: configuracao.maxFritosDia,
            semanasSemRepetir: configuracao.semanasSemRepetir,
            naoRepetirDiasSeguidos: configuracao.naoRepetirDiasSeguidos,
          }}
        />

        <section aria-labelledby="titulo-estrutura" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="titulo-estrutura" className="text-lg font-bold">
                Estrutura do buffet
              </h2>
              <p className="text-suave">
                Cada posição é uma cuba, rechaud ou grelha e diz como o gerador a preenche.
              </p>
            </div>
            <Link href="/regras/posicoes/nova" className="botao-secundario">
              <Plus aria-hidden className="size-5" />
              Nova posição
            </Link>
          </div>

          {Object.values(Area).map((area) => (
            <ListaArea
              key={area}
              area={area}
              posicoes={posicoes.filter((p) => p.area === area)}
              diasFuncionamento={configuracao.diasFuncionamento}
            />
          ))}
        </section>
      </div>
    </>
  );
}

function detalhePosicao(posicao: PosicaoDaLista): string {
  if (posicao.tipo === "LIVRE" && posicao.categoria) {
    return `Qualquer prato ativo de ${ROTULO_CATEGORIA[posicao.categoria].toLowerCase()}`;
  }
  if (posicao.tipo === "SOBRAS") return "Preenchida à mão";
  return posicao.opcoes.map((o) => o.prato.nome).join(" · ") || "Sem prato escolhido";
}

function ListaArea({
  area,
  posicoes,
  diasFuncionamento,
}: {
  area: TArea;
  posicoes: PosicaoDaLista[];
  diasFuncionamento: number[];
}) {
  return (
    <div className="cartao overflow-hidden">
      <h3 className="bg-fundo text-suave border-borda border-b px-4 py-2 text-sm font-bold uppercase">
        {ROTULO_AREA_PLURAL[area]}
      </h3>
      {posicoes.length === 0 ? (
        <p className="text-suave p-4">Nenhuma posição nesta área.</p>
      ) : (
        <ul className="divide-borda divide-y">
          {posicoes.map((posicao) => (
            <li key={posicao.id} className={posicao.ativa ? undefined : "opacity-60"}>
              <Link
                href={`/regras/posicoes/${posicao.id}`}
                className="hover:bg-fundo flex min-h-14 items-center gap-3 px-4 py-2"
              >
                <span
                  aria-hidden
                  className="bg-primaria-clara text-primaria-escura flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                >
                  {posicao.ordem}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex flex-wrap items-center gap-2 font-semibold">
                    <span className="sr-only">
                      {ROTULO_AREA[area]} {posicao.ordem}:
                    </span>
                    {posicao.nome}
                    <span className="border-borda text-suave rounded-full border px-2 py-0.5 text-xs">
                      {ROTULO_TIPO_POSICAO[posicao.tipo]}
                    </span>
                    {!posicao.ativa && (
                      <span className="bg-fundo text-suave border-borda rounded-full border px-2 py-0.5 text-xs">
                        Inativa
                      </span>
                    )}
                  </span>
                  <span className="text-suave truncate text-sm">
                    {detalhePosicao(posicao)} — {resumoDias(posicao.dias, diasFuncionamento)}
                  </span>
                </span>
                <ChevronRight aria-hidden className="text-suave size-5 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
