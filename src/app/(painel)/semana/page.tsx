import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { CabecalhoPagina } from "@/components/painel/cabecalho-pagina";
import { verificarSessao } from "@/lib/auth/dal";
import { ordemPosicao } from "@/lib/gerador/analise";
import {
  diaMes,
  ehDataISO,
  hojeNoRestaurante,
  inicioDaSemana,
  semanaPadrao,
  somarDias,
} from "@/lib/gerador/datas";
import { obterConfiguracao } from "@/lib/regras/dados";
import { pratosPorDia } from "@/lib/exportacao/dados";
import { textoMensagem } from "@/lib/exportacao/texto";
import { obterSemana } from "@/lib/semana/dados";
import { AcoesSemana } from "./acoes-semana";
import { GradeSemana } from "./grade-semana";
import { PainelExportacao } from "./painel-exportacao";

export const metadata: Metadata = { title: "Semana" };

const formatoHomologacao = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export default async function PaginaSemana({ searchParams }: PageProps<"/semana">) {
  await verificarSessao();
  const { inicio } = await searchParams;
  const { diasFuncionamento } = await obterConfiguracao();
  const semanaInicio = ehDataISO(inicio)
    ? inicioDaSemana(inicio, diasFuncionamento)
    : semanaPadrao(hojeNoRestaurante(), diasFuncionamento);

  const semana = await obterSemana(semanaInicio);
  const { cardapio, dias, resumo } = semana;
  const estado = !cardapio ? "vazio" : cardapio.status === "HOMOLOGADO" ? "homologado" : "rascunho";
  const totalAlertas = resumo.reduce((total, dia) => total + dia.alertas.length, 0);

  // Posições ativas, mais as inativas que ainda têm itens nesta semana.
  const comItens = new Set(cardapio?.itens.map((i) => i.posicaoId));
  const posicoes = semana.posicoes
    .filter((p) => p.ativa || comItens.has(p.id))
    .sort((a, b) => ordemPosicao(a) - ordemPosicao(b));

  const periodo = dias.length
    ? `${diaMes(dias[0])} a ${diaMes(dias[dias.length - 1])}`
    : "sem dias de funcionamento";

  return (
    <>
      <CabecalhoPagina
        titulo="Cardápio da semana"
        descricao="Gere a semana, ajuste os pratos e homologue."
        acoes={<AcoesSemana semanaInicio={semanaInicio} estado={estado} alertas={totalAlertas} />}
      />

      <nav aria-label="Trocar de semana" className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/semana?inicio=${somarDias(semanaInicio, -7)}`}
          className="botao-secundario px-3"
          aria-label="Semana anterior"
        >
          <ChevronLeft aria-hidden className="size-5" />
        </Link>
        <p className="min-w-40 text-center text-lg font-bold" aria-live="polite">
          {periodo}
        </p>
        <Link
          href={`/semana?inicio=${somarDias(semanaInicio, 7)}`}
          className="botao-secundario px-3"
          aria-label="Próxima semana"
        >
          <ChevronRight aria-hidden className="size-5" />
        </Link>
        <SeloStatus estado={estado} />
        {cardapio?.homologadoEm && (
          <span className="text-suave text-sm">
            em {formatoHomologacao.format(cardapio.homologadoEm)}
          </span>
        )}
      </nav>

      {dias.length === 0 ? (
        <Vazio>Nenhum dia de funcionamento configurado. Ajuste em Regras.</Vazio>
      ) : !cardapio ? (
        <Vazio>
          Ainda não há cardápio para esta semana. Use “Gerar cardápio da semana” e depois ajuste o
          que quiser.
        </Vazio>
      ) : (
        <>
          {estado === "homologado" && (
            <PainelExportacao
              semanaInicio={semanaInicio}
              dias={[...pratosPorDia(semana)].map(([data, pratos]) => ({
                data,
                mensagem: textoMensagem(data, pratos),
              }))}
            />
          )}
          <GradeSemana
            semanaInicio={semanaInicio}
            dias={dias}
            regras={semana.regras}
            pratos={semana.pratos}
            posicoes={posicoes}
            itens={cardapio.itens}
            resumo={resumo}
            editavel={estado === "rascunho"}
          />
        </>
      )}
    </>
  );
}

function SeloStatus({ estado }: { estado: "vazio" | "rascunho" | "homologado" }) {
  if (estado === "vazio") return null;
  const homologado = estado === "homologado";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${
        homologado ? "border-ok/30 bg-ok/10 text-ok" : "border-alerta/30 bg-alerta/10 text-alerta"
      }`}
    >
      {homologado && <CalendarCheck aria-hidden className="size-4" />}
      {homologado ? "Homologado" : "Rascunho"}
    </span>
  );
}

function Vazio({ children }: { children: ReactNode }) {
  return (
    <div className="cartao text-suave p-8 text-center">
      <p>{children}</p>
    </div>
  );
}
