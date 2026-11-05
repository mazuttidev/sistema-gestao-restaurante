"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { removerPratoAction, type EstadoRemover } from "./actions";

/** Exclusão em dois passos, sem diálogo do navegador. */
export function BotaoRemover({ id, nome }: { id: string; nome: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [estado, acao, removendo] = useActionState<EstadoRemover>(
    removerPratoAction.bind(null, id),
    undefined,
  );

  return (
    <section className="cartao border-erro/30 mt-6 p-4 md:p-6">
      <h2 className="font-bold">Excluir prato</h2>
      <p className="text-suave mt-1">
        Se o prato já foi servido em algum cardápio, ele será desativado para manter o histórico.
      </p>

      {estado && (
        <p role="alert" className="text-erro mt-3 font-semibold">
          {estado.erro}
        </p>
      )}

      {confirmando ? (
        <form action={acao} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={removendo}
            className="bg-erro inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 font-bold text-white disabled:opacity-60"
          >
            <Trash2 aria-hidden className="size-5" />
            {removendo ? "Excluindo…" : `Sim, excluir “${nome}”`}
          </button>
          <button type="button" onClick={() => setConfirmando(false)} className="botao-secundario">
            Cancelar
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="botao-secundario text-erro mt-4"
        >
          <Trash2 aria-hidden className="size-5" />
          Excluir prato
        </button>
      )}
    </section>
  );
}
