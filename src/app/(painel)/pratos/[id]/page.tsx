import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { verificarSessao } from "@/lib/auth/dal";
import { obterPrato } from "@/lib/pratos/dados";
import { BotaoRemover } from "../botao-remover";
import { FormPrato } from "../form-prato";

export const metadata: Metadata = { title: "Editar prato" };

export default async function PaginaEditarPrato({ params }: PageProps<"/pratos/[id]">) {
  await verificarSessao();
  const { id } = await params;
  const prato = await obterPrato(id);
  if (!prato) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <CabecalhoPagina titulo="Editar prato" descricao={prato.nome} />
      <FormPrato prato={prato} />
      <BotaoRemover id={prato.id} nome={prato.nome} />
    </div>
  );
}
