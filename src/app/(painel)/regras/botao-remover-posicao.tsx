"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { removerPosicaoAction } from "./actions";

/** Exclusão em dois passos, sem diálogo do navegador. */
export function BotaoRemoverPosicao({ id, nome }: { id: string; nome: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [removendo, iniciar] = useTransition();

  return (
    <section className="cartao border-erro/30 mt-6 p-4 md:p-6">
      <h2 className="font-bold">Excluir posição</h2>
      <p className="text-suave mt-1">
        Se a posição já foi usada em algum cardápio, ela será desativada para manter o histórico.
      </p>

      {confirmando ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={removendo}
            onClick={() => iniciar(() => removerPosicaoAction(id))}
            className="bg-erro inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 font-bold text-white disabled:opacity-60"
          >
            <Trash2 aria-hidden className="size-5" />
            {removendo ? "Excluindo…" : `Sim, excluir “${nome}”`}
          </button>
          <button type="button" onClick={() => setConfirmando(false)} className="botao-secundario">
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="botao-secundario text-erro mt-4"
        >
          <Trash2 aria-hidden className="size-5" />
          Excluir posição
        </button>
      )}
    </section>
  );
}
