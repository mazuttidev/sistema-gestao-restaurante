import type { Metadata } from "next";
import { CabecalhoPagina, EmConstrucao } from "@/components/painel/cabecalho-pagina";

export const metadata: Metadata = { title: "Semana" };

export default function PaginaSemana() {
  return (
    <>
      <CabecalhoPagina
        titulo="Cardápio da semana"
        descricao="Gere a semana, ajuste os pratos e homologue."
      />
      <EmConstrucao>Geração, ajuste manual e homologação da semana (RF07 a RF11).</EmConstrucao>
    </>
  );
}
