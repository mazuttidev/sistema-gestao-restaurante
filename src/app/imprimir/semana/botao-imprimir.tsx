"use client";

import { Printer } from "lucide-react";

export function BotaoImprimir() {
  return (
    <button type="button" onClick={() => window.print()} className="botao-primario">
      <Printer aria-hidden className="size-5" />
      Imprimir
    </button>
  );
}
