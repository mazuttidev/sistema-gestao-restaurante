import type { ReactNode } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";

/** Faixa de confirmação ou alerta exibida no topo da página após uma ação. */
export function Aviso({
  tipo = "sucesso",
  children,
}: {
  tipo?: "sucesso" | "alerta";
  children: ReactNode;
}) {
  const sucesso = tipo === "sucesso";
  const Icone = sucesso ? CircleCheck : TriangleAlert;
  return (
    <div
      role={sucesso ? "status" : "alert"}
      className={`mb-4 flex items-start gap-2 rounded-lg border px-4 py-3 font-semibold ${
        sucesso ? "border-ok/30 bg-ok/10 text-ok" : "border-alerta/30 bg-alerta/10 text-alerta"
      }`}
    >
      <Icone aria-hidden className="mt-0.5 size-5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
