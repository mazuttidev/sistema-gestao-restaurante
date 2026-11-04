import type { ReactNode } from "react";
import { LogOut, UtensilsCrossed } from "lucide-react";
import { NavInferior, NavLateral } from "@/components/painel/nav-painel";
import { obterUsuarioAtual } from "@/lib/auth/dal";
import { sair } from "../login/actions";

export default async function LayoutPainel({ children }: { children: ReactNode }) {
  const usuario = await obterUsuarioAtual();

  return (
    <div className="min-h-dvh md:flex">
      <aside className="bg-superficie border-borda sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-3">
          <span className="bg-primaria flex size-9 items-center justify-center rounded-full text-white">
            <UtensilsCrossed aria-hidden className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="font-extrabold">Cardápio Certo</p>
            <p className="text-suave text-xs">Restaurante Botafogo</p>
          </div>
        </div>
        <nav aria-label="Principal" className="flex-1">
          <NavLateral />
        </nav>
        <div className="border-borda border-t pt-4">
          <p className="truncate px-3 text-sm font-semibold">{usuario.nome}</p>
          <form action={sair}>
            <button
              type="submit"
              className="text-suave hover:bg-fundo mt-1 flex min-h-11 w-full items-center gap-3 rounded-lg px-3 font-semibold"
            >
              <LogOut aria-hidden className="size-5" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 pb-20 md:pb-0">
        <main className="mx-auto w-full max-w-6xl p-4 md:p-8">{children}</main>
      </div>

      <nav
        aria-label="Principal"
        className="bg-superficie border-borda fixed inset-x-0 bottom-0 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <NavInferior />
      </nav>
    </div>
  );
}
