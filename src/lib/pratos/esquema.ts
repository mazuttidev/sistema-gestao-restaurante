import { z } from "zod";
import { Categoria, MetodoPreparo, Restricao } from "./rotulos";

export const esquemaPrato = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "O nome precisa ter pelo menos 2 letras.")
    .max(80, "O nome pode ter no máximo 80 caracteres."),
  categoria: z.enum(Categoria, { error: "Escolha a categoria." }),
  preparo: z.enum(MetodoPreparo, { error: "Escolha o preparo." }),
  cubas: z.coerce
    .number({ error: "Escolha 1 ou 2 cubas." })
    .int("Escolha 1 ou 2 cubas.")
    .min(1, "Escolha 1 ou 2 cubas.")
    .max(2, "Escolha 1 ou 2 cubas."),
  restricoes: z.array(z.enum(Restricao, { error: "Restrição inválida." })),
  ativo: z.boolean(),
  observacao: z
    .string()
    .trim()
    .max(300, "A observação pode ter no máximo 300 caracteres.")
    .transform((texto) => texto || null),
});

export type DadosPrato = z.infer<typeof esquemaPrato>;
export type ErrosPrato = Partial<Record<keyof DadosPrato, string>>;

export function lerFormularioPrato(formData: FormData) {
  return esquemaPrato.safeParse({
    nome: formData.get("nome") ?? "",
    categoria: formData.get("categoria") ?? undefined,
    preparo: formData.get("preparo") ?? undefined,
    cubas: formData.get("cubas") ?? "1",
    restricoes: formData.getAll("restricoes"),
    ativo: formData.get("ativo") === "on",
    observacao: formData.get("observacao") ?? "",
  });
}

/** Valores crus do formulário, devolvidos ao cliente para reexibir o que foi digitado após um erro. */
export type ValoresFormPrato = {
  nome: string;
  categoria: string;
  preparo: string;
  cubas: string;
  restricoes: string[];
  ativo: boolean;
  observacao: string;
};

export function valoresDoFormulario(formData: FormData): ValoresFormPrato {
  const texto = (campo: string, padrao = "") => {
    const valor = formData.get(campo);
    return typeof valor === "string" ? valor : padrao;
  };
  return {
    nome: texto("nome"),
    categoria: texto("categoria"),
    preparo: texto("preparo"),
    cubas: texto("cubas", "1"),
    restricoes: formData.getAll("restricoes").filter((r): r is string => typeof r === "string"),
    ativo: formData.get("ativo") === "on",
    observacao: texto("observacao"),
  };
}

/** Primeira mensagem de erro de cada campo, para exibir junto ao campo no formulário. */
export function errosPorCampo(erro: Pick<z.ZodError, "issues">): ErrosPrato {
  const erros: ErrosPrato = {};
  for (const issue of erro.issues) {
    const campo = issue.path[0] as keyof DadosPrato;
    erros[campo] ??= issue.message;
  }
  return erros;
}
