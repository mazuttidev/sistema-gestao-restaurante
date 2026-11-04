import type { Metadata } from "next";
import { CabecalhoPagina, EmConstrucao } from "@/components/painel/cabecalho-pagina";

export const metadata: Metadata = { title: "Histórico" };

export default function PaginaHistorico() {
  return (
    <>
      <CabecalhoPagina titulo="Histórico" descricao="Semanas anteriores e o que foi servido." />
      <EmConstrucao>Consulta de cardápios anteriores (RF12).</EmConstrucao>
    </>
  );
}
