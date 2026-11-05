import { CookingPot, Droplet, Flame, Heater, type LucideIcon, Minus } from "lucide-react";
import type { MetodoPreparo } from "@/generated/prisma/enums";
import { ROTULO_PREPARO } from "@/lib/pratos/rotulos";

const ESTILO: Record<MetodoPreparo, { Icone: LucideIcon; classe: string }> = {
  FORNO: { Icone: Heater, classe: "bg-orange-50 text-orange-800 border-orange-200" },
  GRELHA: { Icone: Flame, classe: "bg-stone-100 text-stone-800 border-stone-300" },
  FRITADEIRA: { Icone: Droplet, classe: "bg-amber-50 text-amber-900 border-amber-300" },
  PANELA: { Icone: CookingPot, classe: "bg-primaria-clara text-primaria-escura border-lime-200" },
  NENHUM: { Icone: Minus, classe: "bg-fundo text-suave border-borda" },
};

/** Selo do método de preparo: sempre ícone + texto, nunca só cor. */
export function BadgePreparo({ preparo }: { preparo: MetodoPreparo }) {
  const { Icone, classe } = ESTILO[preparo];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${classe}`}
    >
      <Icone aria-hidden className="size-3.5" />
      {ROTULO_PREPARO[preparo]}
    </span>
  );
}
