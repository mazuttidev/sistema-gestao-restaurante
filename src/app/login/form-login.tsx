"use client";

import { useActionState } from "react";
import { entrar, type EstadoLogin } from "./actions";

export function FormLogin() {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(entrar, undefined);

  return (
    <form action={acao} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={estado?.email}
          aria-invalid={estado ? true : undefined}
          aria-describedby={estado ? "erro-login" : undefined}
          className="campo"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="text-sm font-semibold">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={estado ? true : undefined}
          aria-describedby={estado ? "erro-login" : undefined}
          className="campo"
        />
      </div>

      {estado && (
        <p id="erro-login" role="alert" className="text-erro text-sm font-semibold">
          {estado.erro}
        </p>
      )}

      <button type="submit" disabled={enviando} className="botao-primario mt-2">
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
