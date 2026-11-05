"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import type { FiltrosPratos } from "@/lib/pratos/filtros";
import { Categoria, MetodoPreparo, ROTULO_CATEGORIA, ROTULO_PREPARO } from "@/lib/pratos/rotulos";

// Formulário GET: os filtros ficam na URL (dá para voltar, recarregar e compartilhar).
// Mudar um select já aplica; a busca aplica com Enter ou no botão.
export function FiltrosPratosForm({ filtros }: { filtros: FiltrosPratos }) {
  const aplicar = (e: React.ChangeEvent<HTMLSelectElement>) =>
    e.currentTarget.form?.requestSubmit();
  const temFiltro =
    filtros.busca || filtros.categoria || filtros.preparo || filtros.status !== "ativos";

  return (
    <form
      role="search"
      className="cartao mb-4 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto_auto]"
    >
      <label className="relative">
        <span className="sr-only">Buscar prato pelo nome</span>
        <Search aria-hidden className="text-suave absolute top-3 left-3 size-5" />
        <input
          type="search"
          name="q"
          defaultValue={filtros.busca}
          placeholder="Buscar pelo nome"
          className="campo w-full pl-10"
        />
      </label>
      <label>
        <span className="sr-only">Categoria</span>
        <select
          name="categoria"
          defaultValue={filtros.categoria ?? ""}
          onChange={aplicar}
          className="campo w-full"
        >
          <option value="">Todas as categorias</option>
          {Object.values(Categoria).map((c) => (
            <option key={c} value={c}>
              {ROTULO_CATEGORIA[c]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Preparo</span>
        <select
          name="preparo"
          defaultValue={filtros.preparo ?? ""}
          onChange={aplicar}
          className="campo w-full"
        >
          <option value="">Todos os preparos</option>
          {Object.values(MetodoPreparo).map((p) => (
            <option key={p} value={p}>
              {ROTULO_PREPARO[p]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Situação</span>
        <select
          name="status"
          defaultValue={filtros.status}
          onChange={aplicar}
          className="campo w-full"
        >
          <option value="ativos">Ativos</option>
          <option value="inativos">Inativos</option>
          <option value="todos">Ativos e inativos</option>
        </select>
      </label>
      <div className="flex gap-2">
        <button type="submit" className="botao-secundario flex-1">
          Buscar
        </button>
        {temFiltro && (
          <Link href="/pratos" className="botao-secundario">
            Limpar
          </Link>
        )}
      </div>
    </form>
  );
}
