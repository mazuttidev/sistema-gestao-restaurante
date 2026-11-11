import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { verificarSessao } from "@/lib/auth/dal";
import { listarPratosParaOpcoes, obterConfiguracao, obterPosicao } from "@/lib/regras/dados";
import { ROTULO_AREA } from "@/lib/regras/rotulos";
import { BotaoRemoverPosicao } from "../../botao-remover-posicao";
import { FormPosicao } from "../../form-posicao";

export const metadata: Metadata = { title: "Editar posição" };

export default async function PaginaEditarPosicao({ params }: PageProps<"/regras/posicoes/[id]">) {
  await verificarSessao();
  const { id } = await params;
  const posicao = await obterPosicao(id);
  if (!posicao) notFound();
  const [pratos, configuracao] = await Promise.all([
    listarPratosParaOpcoes(posicao.opcoes.map((o) => o.prato.id)),
    obterConfiguracao(),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <CabecalhoPagina
        titulo="Editar posição"
        descricao={`${ROTULO_AREA[posicao.area]} ${posicao.ordem} — ${posicao.nome}`}
      />
      <FormPosicao
        posicao={posicao}
        pratos={pratos}
        diasFuncionamento={configuracao.diasFuncionamento}
      />
      <BotaoRemoverPosicao id={posicao.id} nome={posicao.nome} />
    </div>
  );
}
