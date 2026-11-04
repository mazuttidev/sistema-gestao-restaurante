"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  History,
  House,
  type LucideIcon,
  Menu,
  SlidersHorizontal,
  UtensilsCrossed,
} from "lucide-react";

type Item = { href: string; rotulo: string; Icone: LucideIcon };

const ITENS_LATERAL: Item[] = [
  { href: "/", rotulo: "Início", Icone: House },
  { href: "/semana", rotulo: "Semana", Icone: CalendarDays },
  { href: "/pratos", rotulo: "Pratos", Icone: UtensilsCrossed },
  { href: "/regras", rotulo: "Regras", Icone: SlidersHorizontal },
  { href: "/historico", rotulo: "Histórico", Icone: History },
];

// No celular cabem 4 itens; Regras, Histórico e Conta ficam em "Mais".
const ITENS_INFERIOR: Item[] = [
  ITENS_LATERAL[0],
  ITENS_LATERAL[1],
  ITENS_LATERAL[2],
  { href: "/mais", rotulo: "Mais", Icone: Menu },
];

function estaAtivo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavLateral() {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-1">
      {ITENS_LATERAL.map(({ href, rotulo, Icone }) => {
        const ativo = estaAtivo(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={ativo ? "page" : undefined}
              className="hover:bg-fundo aria-[current=page]:bg-primaria-clara aria-[current=page]:text-primaria-escura flex min-h-11 items-center gap-3 rounded-lg px-3 font-semibold"
            >
              <Icone aria-hidden className="size-5" />
              {rotulo}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NavInferior() {
  const pathname = usePathname();
  const emMais = ["/mais", "/regras", "/historico"].some((r) => pathname.startsWith(r));
  return (
    <ul className="grid grid-cols-4">
      {ITENS_INFERIOR.map(({ href, rotulo, Icone }) => {
        const ativo = href === "/mais" ? emMais : estaAtivo(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={ativo ? "page" : undefined}
              className="text-suave aria-[current=page]:text-primaria flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold"
            >
              <Icone aria-hidden className="size-6" />
              {rotulo}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
