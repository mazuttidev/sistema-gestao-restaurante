"use client";

import { useState, useTransition } from "react";
import { CircleCheck, LockOpen, Sparkles } from "lucide-react";
import { gerarSemanaAction, homologarAction, reabrirAction, type RespostaSemana } from "./actions";

type Estado = "vazio" | "rascunho" | "homologado";
type Confirmacao = "regenerar" | "homologar" | "reabrir" | null;

const TEXTO_CONFIRMACAO = {
  regenerar: {
    pergunta: "Gerar de novo troca todos os pratos que não estão travados. Continuar?",
    botao: "Sim, gerar de novo",
  },
  homologar: {
    pergunta: "Depois de homologado, o cardápio vira a lista oficial e não pode ser editado.",
    botao: "Sim, homologar",
  },
  reabrir: {
    pergunta: "Reabrir permite editar de novo. A lista oficial deixa de valer até homologar.",
    botao: "Sim, reabrir",
  },
} as const;

/** Botões principais da semana: gerar, homologar e reabrir, com confirmação em dois passos. */
export function AcoesSemana({
  semanaInicio,
  estado,
  alertas,
}: {
  semanaInicio: string;
  estado: Estado;
  alertas: number;
}) {
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string>();
  const [confirmando, setConfirmando] = useState<Confirmacao>(null);

  const executar = (acao: () => Promise<RespostaSemana>) =>
    iniciar(async () => {
      const resposta = await acao();
      setErro(resposta.erro);
      setConfirmando(null);
    });

  const acoes = {
    regenerar: () => executar(() => gerarSemanaAction(semanaInicio)),
    homologar: () => executar(() => homologarAction(semanaInicio)),
    reabrir: () => executar(() => reabrirAction(semanaInicio)),
  };

  if (confirmando) {
    const { pergunta, botao } = TEXTO_CONFIRMACAO[confirmando];
    return (
      <div
        role="alertdialog"
        aria-label="Confirmação"
        className="cartao flex max-w-md flex-col gap-3 p-4"
      >
        <p className="font-semibold">{pergunta}</p>
        {confirmando === "homologar" && alertas > 0 && (
          <p className="text-alerta text-sm font-semibold">
            Atenção: a semana tem {alertas} alerta{alertas > 1 ? "s" : ""} de regra.
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={pendente}
            onClick={acoes[confirmando]}
            className="botao-primario"
          >
            {pendente ? "Aguarde…" : botao}
          </button>
          <button type="button" onClick={() => setConfirmando(null)} className="botao-secundario">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2">
        {estado === "vazio" && (
          <button
            type="button"
            disabled={pendente}
            onClick={acoes.regenerar}
            className="botao-primario"
          >
            <Sparkles aria-hidden className="size-5" />
            {pendente ? "Gerando…" : "Gerar cardápio da semana"}
          </button>
        )}
        {estado === "rascunho" && (
          <>
            <button
              type="button"
              disabled={pendente}
              onClick={() => setConfirmando("regenerar")}
              className="botao-secundario"
            >
              <Sparkles aria-hidden className="size-5" />
              Gerar de novo
            </button>
            <button
              type="button"
              disabled={pendente}
              onClick={() => setConfirmando("homologar")}
              className="botao-primario"
            >
              <CircleCheck aria-hidden className="size-5" />
              Homologar
            </button>
          </>
        )}
        {estado === "homologado" && (
          <button
            type="button"
            disabled={pendente}
            onClick={() => setConfirmando("reabrir")}
            className="botao-secundario"
          >
            <LockOpen aria-hidden className="size-5" />
            Reabrir para ajustes
          </button>
        )}
      </div>
      {erro && (
        <p role="alert" className="text-erro font-semibold">
          {erro}
        </p>
      )}
    </div>
  );
}
