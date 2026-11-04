import type { Metadata } from "next";
import { CabecalhoPagina, EmConstrucao } from "@/components/painel/cabecalho-pagina";

export const metadata: Metadata = { title: "Pratos" };

export default function PaginaPratos() {
  return (
    <>
      <CabecalhoPagina
        titulo="Pratos"
        descricao="Os pratos que o gerador usa para montar a semana."
      />
      <EmConstrucao>Cadastro, categorização e filtros de pratos (RF02 a RF05).</EmConstrucao>
    </>
  );
}
