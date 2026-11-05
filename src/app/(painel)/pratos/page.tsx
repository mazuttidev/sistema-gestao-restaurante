import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Power, PowerOff } from "lucide-react";
import { Aviso } from "@/components/painel/aviso";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { BadgePreparo } from "@/components/pratos/badge-preparo";
import { verificarSessao } from "@/lib/auth/dal";
import { listarPratos, type PratoDaLista } from "@/lib/pratos/dados";
import { lerFiltros } from "@/lib/pratos/filtros";
import { ROTULO_CATEGORIA, ROTULO_RESTRICAO } from "@/lib/pratos/rotulos";
import { alternarAtivoAction } from "./actions";
import { FiltrosPratosForm } from "./filtros-pratos";

export const metadata: Metadata = { title: "Pratos" };

function textoAviso(aviso: string | undefined, nome: string | undefined) {
  if (aviso === "salvo") return `“${nome ?? "Prato"}” salvo.`;
  if (aviso === "excluido") return "Prato excluído.";
  if (aviso === "desativado")
    return "Este prato já foi servido em cardápios, então foi desativado em vez de excluído.";
}

export default async function PaginaPratos({ searchParams }: PageProps<"/pratos">) {
  await verificarSessao();
  const parametros = await searchParams;
  const filtros = lerFiltros(parametros);
  const { pratos, total } = await listarPratos(filtros);
  const aviso = textoAviso(
    typeof parametros.aviso === "string" ? parametros.aviso : undefined,
    typeof parametros.nome === "string" ? parametros.nome : undefined,
  );

  return (
    <>
      <CabecalhoPagina
        titulo="Pratos"
        descricao="Os pratos que o gerador usa para montar a semana."
        acoes={
          <Link href="/pratos/novo" className="botao-primario">
            <Plus aria-hidden className="size-5" />
            Novo prato
          </Link>
        }
      />

      {aviso && <Aviso>{aviso}</Aviso>}

      <FiltrosPratosForm filtros={filtros} />

      <p className="text-suave mb-3 text-sm" aria-live="polite">
        {pratos.length === total ? `${total} pratos` : `${pratos.length} de ${total} pratos`}
      </p>

      {pratos.length === 0 ? (
        <div className="cartao text-suave p-8 text-center">
          <p className="text-texto font-bold">Nenhum prato encontrado.</p>
          <p className="mt-1">Mude os filtros ou cadastre um prato novo.</p>
        </div>
      ) : (
        <>
          <TabelaPratos pratos={pratos} />
          <ListaPratos pratos={pratos} />
        </>
      )}
    </>
  );
}

function Restricoes({ prato }: { prato: PratoDaLista }) {
  if (prato.restricoes.length === 0) return null;
  return (
    <span className="text-suave text-xs">
      {prato.restricoes.map((r) => ROTULO_RESTRICAO[r]).join(" · ")}
    </span>
  );
}

function BotaoAtivo({ prato }: { prato: PratoDaLista }) {
  const Icone = prato.ativo ? PowerOff : Power;
  const rotulo = prato.ativo ? `Desativar ${prato.nome}` : `Ativar ${prato.nome}`;
  return (
    <form action={alternarAtivoAction.bind(null, prato.id, !prato.ativo)}>
      <button
        type="submit"
        aria-label={rotulo}
        title={rotulo}
        className="text-suave hover:bg-fundo hover:text-texto flex size-11 items-center justify-center rounded-lg"
      >
        <Icone aria-hidden className="size-5" />
      </button>
    </form>
  );
}

function SeloInativo({ ativo }: { ativo: boolean }) {
  if (ativo) return null;
  return (
    <span className="bg-fundo text-suave border-borda rounded-full border px-2 py-0.5 text-xs font-semibold">
      Inativo
    </span>
  );
}

function TabelaPratos({ pratos }: { pratos: PratoDaLista[] }) {
  return (
    <div className="cartao hidden overflow-hidden md:block">
      <table className="w-full text-left">
        <thead className="bg-fundo text-suave text-sm">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Nome
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Categoria
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Preparo
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Cubas
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-borda divide-y">
          {pratos.map((prato) => (
            <tr key={prato.id} className={prato.ativo ? undefined : "opacity-60"}>
              <td className="px-4 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/pratos/${prato.id}`} className="font-semibold hover:underline">
                    {prato.nome}
                  </Link>
                  <SeloInativo ativo={prato.ativo} />
                </div>
                <Restricoes prato={prato} />
              </td>
              <td className="px-4 py-2">{ROTULO_CATEGORIA[prato.categoria]}</td>
              <td className="px-4 py-2">
                <BadgePreparo preparo={prato.preparo} />
              </td>
              <td className="px-4 py-2">{prato.cubas === 2 ? "×2" : "1"}</td>
              <td className="px-2 py-1">
                <BotaoAtivo prato={prato} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListaPratos({ pratos }: { pratos: PratoDaLista[] }) {
  return (
    <ul className="flex flex-col gap-2 md:hidden">
      {pratos.map((prato) => (
        <li
          key={prato.id}
          className={`cartao flex items-center gap-2 p-3 ${prato.ativo ? "" : "opacity-60"}`}
        >
          <Link href={`/pratos/${prato.id}`} className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-semibold">
              {prato.nome}
              {prato.cubas === 2 && <span className="text-suave font-normal"> ×2</span>}
            </span>
            <span className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-suave">{ROTULO_CATEGORIA[prato.categoria]}</span>
              <BadgePreparo preparo={prato.preparo} />
              <SeloInativo ativo={prato.ativo} />
            </span>
            <Restricoes prato={prato} />
          </Link>
          <BotaoAtivo prato={prato} />
        </li>
      ))}
    </ul>
  );
}
