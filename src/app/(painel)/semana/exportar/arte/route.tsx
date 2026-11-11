import { ImageResponse } from "next/og";
import { verificarSessao } from "@/lib/auth/dal";
import { MENSAGEM_ERRO_EXPORTACAO, obterPratosDoDia } from "@/lib/exportacao/dados";
import { diaMes, ehDataISO, nomeDoDia } from "@/lib/gerador/datas";

// Arte do dia em 1080×1920 px para story e grupos (RF15).
// Cores da paleta do painel (src/app/globals.css). Ajustar ao modelo do Canva quando o
// restaurante enviar (docs/PLANEJAMENTO.md, pendências).
const COR = {
  fundo: "#faf7f2",
  texto: "#2b2620",
  primaria: "#4f6b2a",
  terracota: "#b5532f",
  borda: "#e6dfd3",
};

/** Tamanho da fonte dos pratos para caber na arte, de 64 px (poucos) a 40 px (muitos). */
function tamanhoFonte(quantidade: number): number {
  if (quantidade <= 10) return 64;
  if (quantidade <= 14) return 54;
  if (quantidade <= 18) return 46;
  return 40;
}

export async function GET(request: Request) {
  await verificarSessao();
  const parametros = new URL(request.url).searchParams;
  const data = parametros.get("data");
  if (!ehDataISO(data)) return new Response("Data inválida.", { status: 400 });

  const resultado = await obterPratosDoDia(data);
  if (!resultado.ok) {
    return new Response(MENSAGEM_ERRO_EXPORTACAO[resultado.erro], {
      status: 409,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const { pratos } = resultado;
  const fonte = tamanhoFonte(pratos.length);
  const [dia, mes] = diaMes(data).split("/");
  const baixar = parametros.get("baixar") === "1";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: COR.fundo,
        color: COR.texto,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "110px 60px 70px",
          backgroundColor: COR.primaria,
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 44, letterSpacing: 6 }}>RESTAURANTE BOTAFOGO</div>
        <div style={{ fontSize: 104, fontWeight: 700, marginTop: 24 }}>Cardápio do dia</div>
        <div style={{ fontSize: 56, marginTop: 16 }}>{`${nomeDoDia(data)}, ${dia}/${mes}`}</div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 70px",
        }}
      >
        {pratos.map((prato, indice) => (
          <div
            key={prato}
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              textAlign: "center",
              fontSize: fonte,
              lineHeight: 1.2,
              padding: `${Math.round(fonte * 0.28)}px 0`,
              borderTop: indice === 0 ? "none" : `2px solid ${COR.borda}`,
            }}
          >
            {prato}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "48px 60px 120px",
          fontSize: 44,
          color: COR.terracota,
          fontWeight: 700,
        }}
      >
        Bom apetite!
      </div>
    </div>,
    {
      width: 1080,
      height: 1920,
      headers: {
        "Cache-Control": "no-store",
        ...(baixar && {
          "Content-Disposition": `attachment; filename="cardapio ${dia}-${mes}.png"`,
        }),
      },
    },
  );
}
