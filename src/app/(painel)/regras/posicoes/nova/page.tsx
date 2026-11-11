import type { Metadata } from "next";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { verificarSessao } from "@/lib/auth/dal";
import { listarPratosParaOpcoes, obterConfiguracao, proximaOrdem } from "@/lib/regras/dados";
import { FormPosicao } from "../../form-posicao";

export const metadata: Metadata = { title: "Nova posição" };

export default async function PaginaNovaPosicao() {
  await verificarSessao();
  const [pratos, configuracao, ordem] = await Promise.all([
    listarPratosParaOpcoes(),
    obterConfiguracao(),
    proximaOrdem("CUBA"),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <CabecalhoPagina titulo="Nova posição" descricao="Uma cuba, rechaud ou lugar na grelha." />
      <FormPosicao
        pratos={pratos}
        ordemInicial={ordem}
        diasFuncionamento={configuracao.diasFuncionamento}
      />
    </div>
  );
}
