import { z } from "zod";
import { Categoria } from "@/lib/pratos/rotulos";
import { Area, TipoPosicao } from "./rotulos";

const diaDaSemana = z.coerce.number().int().min(0).max(6);
const semDuplicados = (dias: number[]) => [...new Set(dias)].sort((a, b) => a - b);

function lerDias(formData: FormData, campo: string): unknown[] {
  return formData.getAll(campo).filter((v) => typeof v === "string" && v !== "");
}

// ---------- Configuração geral ----------

export const esquemaConfiguracao = z.object({
  diasFuncionamento: z
    .array(diaDaSemana, { error: "Dia inválido." })
    .min(1, "Escolha pelo menos um dia de funcionamento.")
    .transform(semDuplicados),
  maxFritosDia: z.coerce
    .number({ error: "Informe um número." })
    .int("Informe um número inteiro.")
    .min(0, "O limite não pode ser negativo.")
    .max(20, "Use no máximo 20."),
  semanasSemRepetir: z.coerce
    .number({ error: "Informe um número." })
    .int("Informe um número inteiro.")
    .min(0, "Use 0 para desligar a regra.")
    .max(8, "Use no máximo 8 semanas."),
  naoRepetirDiasSeguidos: z.boolean(),
});

export type DadosConfiguracao = z.infer<typeof esquemaConfiguracao>;
export type ErrosConfiguracao = Partial<Record<keyof DadosConfiguracao, string>>;

export function lerFormularioConfiguracao(formData: FormData) {
  return esquemaConfiguracao.safeParse({
    diasFuncionamento: lerDias(formData, "diasFuncionamento"),
    maxFritosDia: formData.get("maxFritosDia") ?? "",
    semanasSemRepetir: formData.get("semanasSemRepetir") ?? "",
    naoRepetirDiasSeguidos: formData.get("naoRepetirDiasSeguidos") === "on",
  });
}

// ---------- Posição do buffet ----------

export const esquemaPosicao = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, "O nome precisa ter pelo menos 2 letras.")
      .max(40, "O nome pode ter no máximo 40 caracteres."),
    area: z.enum(Area, { error: "Escolha a área." }),
    ordem: z.coerce
      .number({ error: "Informe o número." })
      .int("Informe um número inteiro.")
      .min(1, "Use um número a partir de 1.")
      .max(30, "Use no máximo 30."),
    tipo: z.enum(TipoPosicao, { error: "Escolha o tipo." }),
    categoria: z.enum(Categoria, { error: "Escolha a categoria." }).nullable(),
    opcoes: z.array(z.string().min(1)).transform((ids) => [...new Set(ids)]),
    dias: z.array(diaDaSemana, { error: "Dia inválido." }).transform(semDuplicados),
    ativa: z.boolean(),
  })
  .superRefine((posicao, ctx) => {
    if (posicao.tipo === "LIVRE" && !posicao.categoria) {
      ctx.addIssue({
        code: "custom",
        path: ["categoria"],
        message: "Escolha de qual categoria o gerador vai tirar o prato.",
      });
    }
    if (posicao.tipo === "FIXA" && posicao.opcoes.length !== 1) {
      ctx.addIssue({ code: "custom", path: ["opcoes"], message: "Escolha um prato." });
    }
    if (posicao.tipo === "VARIAVEL" && posicao.opcoes.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["opcoes"],
        message: "Escolha pelo menos dois pratos para alternar.",
      });
    }
  })
  // Cada tipo guarda só o que usa: categoria só em LIVRE, opções só em FIXA/VARIAVEL.
  .transform((posicao) => ({
    ...posicao,
    categoria: posicao.tipo === "LIVRE" ? posicao.categoria : null,
    opcoes: posicao.tipo === "FIXA" || posicao.tipo === "VARIAVEL" ? posicao.opcoes : [],
  }));

export type DadosPosicao = z.infer<typeof esquemaPosicao>;
export type ErrosPosicao = Partial<Record<keyof DadosPosicao, string>>;

export function lerFormularioPosicao(formData: FormData) {
  const categoria = formData.get("categoria");
  return esquemaPosicao.safeParse({
    nome: formData.get("nome") ?? "",
    area: formData.get("area") ?? undefined,
    ordem: formData.get("ordem") ?? "",
    tipo: formData.get("tipo") ?? undefined,
    categoria: typeof categoria === "string" && categoria !== "" ? categoria : null,
    opcoes: formData.getAll("opcoes").filter((v) => typeof v === "string"),
    dias: lerDias(formData, "dias"),
    ativa: formData.get("ativa") === "on",
  });
}

/** Primeira mensagem de erro de cada campo. */
export function errosPorCampo<T extends string>(
  erro: Pick<z.ZodError, "issues">,
): Partial<Record<T, string>> {
  const erros: Partial<Record<T, string>> = {};
  for (const issue of erro.issues) {
    const campo = issue.path[0] as T;
    erros[campo] ??= issue.message;
  }
  return erros;
}
