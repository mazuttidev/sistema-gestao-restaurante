import type { Metadata } from "next";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { verificarSessao } from "@/lib/auth/dal";
import { FormPrato } from "../form-prato";

export const metadata: Metadata = { title: "Novo prato" };

export default async function PaginaNovoPrato() {
  await verificarSessao();
  return (
    <div className="mx-auto max-w-2xl">
      <CabecalhoPagina titulo="Novo prato" />
      <FormPrato />
    </div>
  );
}
