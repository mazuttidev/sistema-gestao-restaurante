export const opcaoSegmentada =
  "border-borda has-checked:border-primaria has-checked:bg-primaria-clara has-checked:text-primaria-escura has-focus-visible:ring-primaria/30 flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-center font-semibold has-focus-visible:ring-4";

export function ErroCampo({ id, erro }: { id: string; erro?: string }) {
  if (!erro) return null;
  return (
    <p id={id} className="text-erro text-sm font-semibold">
      {erro}
    </p>
  );
}
