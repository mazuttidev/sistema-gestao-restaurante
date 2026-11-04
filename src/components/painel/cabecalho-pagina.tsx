import type { ReactNode } from "react";

export function CabecalhoPagina({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold md:text-3xl">{titulo}</h1>
        {descricao && <p className="text-suave mt-1">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </header>
  );
}

/** Marcador das seções que ainda serão implementadas (ver tarefas no Notion). */
export function EmConstrucao({ children }: { children: ReactNode }) {
  return (
    <div className="cartao text-suave border-dashed p-8 text-center">
      <p className="text-texto font-bold">Em construção</p>
      <p className="mt-1">{children}</p>
    </div>
  );
}
