"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { PratoCompleto } from "@/lib/pratos/dados";
import type { ValoresFormPrato } from "@/lib/pratos/esquema";
import {
  Categoria,
  MetodoPreparo,
  Restricao,
  ROTULO_CATEGORIA,
  ROTULO_PREPARO,
  ROTULO_RESTRICAO,
} from "@/lib/pratos/rotulos";
import { salvarPratoAction, type EstadoFormPrato } from "./actions";

function ErroCampo({ id, erro }: { id: string; erro?: string }) {
  if (!erro) return null;
  return (
    <p id={id} className="text-erro text-sm font-semibold">
      {erro}
    </p>
  );
}

const opcaoSegmentada =
  "border-borda has-checked:border-primaria has-checked:bg-primaria-clara has-checked:text-primaria-escura has-focus-visible:ring-primaria/30 flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-center font-semibold has-focus-visible:ring-4";

function valoresIniciais(prato?: PratoCompleto): ValoresFormPrato {
  return {
    nome: prato?.nome ?? "",
    categoria: prato?.categoria ?? "",
    preparo: prato?.preparo ?? "",
    cubas: String(prato?.cubas ?? 1),
    restricoes: prato?.restricoes ?? [],
    ativo: prato?.ativo ?? true,
    observacao: prato?.observacao ?? "",
  };
}

export function FormPrato({ prato }: { prato?: PratoCompleto }) {
  const [estado, acao, salvando] = useActionState<EstadoFormPrato, FormData>(
    salvarPratoAction,
    undefined,
  );
  const erros = estado?.erros ?? {};
  // Após um erro, os campos voltam com o que foi enviado (o React limpa o form após a action).
  const valores = estado?.valores ?? valoresIniciais(prato);

  return (
    <form
      // Remonta o form com os valores enviados: o reset do React não restaura o <select>
      // a partir de um defaultValue alterado depois da montagem.
      key={JSON.stringify(estado?.valores ?? null)}
      action={acao}
      className="cartao flex flex-col gap-6 p-4 md:p-6"
      noValidate
    >
      {prato && <input type="hidden" name="id" value={prato.id} />}

      {estado?.mensagem && (
        <p role="alert" className="text-erro font-semibold">
          {estado.mensagem}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="font-semibold">
          Nome do prato
        </label>
        <input
          id="nome"
          name="nome"
          required
          maxLength={80}
          defaultValue={valores.nome}
          aria-invalid={erros.nome ? true : undefined}
          aria-describedby={erros.nome ? "erro-nome" : undefined}
          className="campo"
        />
        <ErroCampo id="erro-nome" erro={erros.nome} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="categoria" className="font-semibold">
          Categoria
        </label>
        <select
          id="categoria"
          name="categoria"
          aria-required="true"
          defaultValue={valores.categoria}
          aria-invalid={erros.categoria ? true : undefined}
          aria-describedby={erros.categoria ? "erro-categoria" : undefined}
          className="campo"
        >
          <option value="" disabled>
            Escolha…
          </option>
          {Object.values(Categoria).map((c) => (
            <option key={c} value={c}>
              {ROTULO_CATEGORIA[c]}
            </option>
          ))}
        </select>
        <ErroCampo id="erro-categoria" erro={erros.categoria} />
      </div>

      <fieldset
        className="flex flex-col gap-1.5"
        aria-describedby={erros.preparo ? "erro-preparo" : "dica-preparo"}
      >
        <legend className="mb-1.5 font-semibold">Preparo</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {Object.values(MetodoPreparo).map((p) => (
            <label key={p} className={opcaoSegmentada}>
              <input
                type="radio"
                name="preparo"
                value={p}
                defaultChecked={valores.preparo === p}
                className="sr-only"
              />
              {ROTULO_PREPARO[p]}
            </label>
          ))}
        </div>
        <p id="dica-preparo" className="text-suave text-sm">
          Pratos da fritadeira contam no limite de fritos do dia.
        </p>
        <ErroCampo id="erro-preparo" erro={erros.preparo} />
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 font-semibold">Ocupa no buffet</legend>
        <div className="grid max-w-xs grid-cols-2 gap-2">
          {[1, 2].map((n) => (
            <label key={n} className={opcaoSegmentada}>
              <input
                type="radio"
                name="cubas"
                value={n}
                defaultChecked={valores.cubas === String(n)}
                className="sr-only"
              />
              {n === 1 ? "1 cuba" : "2 cubas"}
            </label>
          ))}
        </div>
        <ErroCampo id="erro-cubas" erro={erros.cubas} />
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 font-semibold">Restrições alimentares</legend>
        <div className="flex flex-wrap gap-2">
          {Object.values(Restricao).map((r) => (
            <label key={r} className={opcaoSegmentada}>
              <input
                type="checkbox"
                name="restricoes"
                value={r}
                defaultChecked={valores.restricoes.includes(r)}
                className="sr-only"
              />
              {ROTULO_RESTRICAO[r]}
            </label>
          ))}
        </div>
        <ErroCampo id="erro-restricoes" erro={erros.restricoes} />
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="observacao" className="font-semibold">
          Observação <span className="text-suave font-normal">(opcional)</span>
        </label>
        <textarea
          id="observacao"
          name="observacao"
          rows={2}
          maxLength={300}
          defaultValue={valores.observacao}
          placeholder="Ex.: depende do fornecedor de peixe-rei"
          className="campo py-2"
        />
        <ErroCampo id="erro-observacao" erro={erros.observacao} />
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 font-semibold">
        <input
          type="checkbox"
          name="ativo"
          defaultChecked={valores.ativo}
          className="accent-primaria size-5"
        />
        Ativo (o gerador pode usar este prato)
      </label>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href="/pratos" className="botao-secundario">
          Cancelar
        </Link>
        <button type="submit" disabled={salvando} className="botao-primario">
          {salvando ? "Salvando…" : "Salvar prato"}
        </button>
      </div>
    </form>
  );
}
