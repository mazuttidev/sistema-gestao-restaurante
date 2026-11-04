import type { Metadata } from "next";
import { CabecalhoPagina, EmConstrucao } from "@/components/painel/cabecalho-pagina";

export const metadata: Metadata = { title: "Regras" };

export default function PaginaRegras() {
  return (
    <>
      <CabecalhoPagina
        titulo="Regras e estrutura do buffet"
        descricao="Dias de funcionamento, posições do buffet, limite de fritos e repetição."
      />
      <EmConstrucao>Configuração de regras e da estrutura do buffet (RF06).</EmConstrucao>
    </>
  );
}
