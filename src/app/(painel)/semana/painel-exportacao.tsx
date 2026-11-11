"use client";

import { useState } from "react";
import { Check, Copy, FileText, Image as IconeImagem, Printer } from "lucide-react";
import { diaMes, nomeDoDia, type DataISO } from "@/lib/gerador/datas";

type Dia = { data: DataISO; mensagem: string };

/** Exportações da semana homologada: impressão, .txt, arte e texto para mensagens (M3). */
export function PainelExportacao({ semanaInicio, dias }: { semanaInicio: DataISO; dias: Dia[] }) {
  const [copiado, setCopiado] = useState<DataISO>();
  const [erroCopia, setErroCopia] = useState<string>();

  const copiar = async (dia: Dia) => {
    try {
      await navigator.clipboard.writeText(dia.mensagem);
      setCopiado(dia.data);
      setErroCopia(undefined);
      setTimeout(() => setCopiado((atual) => (atual === dia.data ? undefined : atual)), 2500);
    } catch {
      setErroCopia("Não foi possível copiar. Tente de novo.");
    }
  };

  const link =
    "border-borda hover:bg-fundo inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold";

  return (
    <section aria-labelledby="titulo-exportar" className="cartao mb-4 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="titulo-exportar" className="text-lg font-bold">
          Exportar
        </h2>
        <a
          href={`/imprimir/semana?inicio=${semanaInicio}`}
          target="_blank"
          rel="noopener"
          className="botao-secundario"
        >
          <Printer aria-hidden className="size-5" />
          Imprimir semana
        </a>
      </div>
      {erroCopia && (
        <p role="alert" className="text-erro mb-2 font-semibold">
          {erroCopia}
        </p>
      )}
      <ul className="divide-borda divide-y">
        {dias.map((dia) => {
          const rotulo = `${nomeDoDia(dia.data)} ${diaMes(dia.data)}`;
          return (
            <li key={dia.data} className="flex flex-wrap items-center gap-2 py-2">
              <span className="w-32 font-semibold">{rotulo}</span>
              <a
                href={`/semana/exportar/txt?data=${dia.data}`}
                className={link}
                aria-label={`Baixar .txt das etiquetas de ${rotulo}`}
              >
                <FileText aria-hidden className="size-4" /> .txt
              </a>
              <a
                href={`/semana/exportar/arte?data=${dia.data}`}
                target="_blank"
                rel="noopener"
                className={link}
                aria-label={`Ver arte de ${rotulo}`}
              >
                <IconeImagem aria-hidden className="size-4" /> Arte
              </a>
              <button
                type="button"
                onClick={() => copiar(dia)}
                className={link}
                aria-label={`Copiar texto de ${rotulo} para WhatsApp`}
              >
                {copiado === dia.data ? (
                  <>
                    <Check aria-hidden className="text-ok size-4" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy aria-hidden className="size-4" /> Copiar texto
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="sr-only" aria-live="polite">
        {copiado ? "Texto copiado." : ""}
      </p>
    </section>
  );
}
