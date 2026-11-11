import { verificarSessao } from "@/lib/auth/dal";
import { MENSAGEM_ERRO_EXPORTACAO, obterPratosDoDia } from "@/lib/exportacao/dados";
import { nomeArquivoTxt, txtEtiquetas } from "@/lib/exportacao/texto";
import { ehDataISO } from "@/lib/gerador/datas";

/** Baixa o .txt das etiquetas do buffet de um dia homologado (RF14). */
export async function GET(request: Request) {
  await verificarSessao();
  const data = new URL(request.url).searchParams.get("data");
  if (!ehDataISO(data)) return new Response("Data inválida.", { status: 400 });

  const resultado = await obterPratosDoDia(data);
  if (!resultado.ok) {
    return new Response(MENSAGEM_ERRO_EXPORTACAO[resultado.erro], {
      status: 409,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const nome = nomeArquivoTxt(data);
  return new Response(txtEtiquetas(resultado.pratos), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}
