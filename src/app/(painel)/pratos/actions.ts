"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verificarSessao } from "@/lib/auth/dal";
import { definirAtivo, removerPrato, salvarPrato } from "@/lib/pratos/dados";
import {
  errosPorCampo,
  lerFormularioPrato,
  valoresDoFormulario,
  type ErrosPrato,
  type ValoresFormPrato,
} from "@/lib/pratos/esquema";

// `valores` volta para o formulário: o React limpa o form após a action, e sem isso o
// gestor perderia o que digitou quando houver erro.
export type EstadoFormPrato =
  { erros: ErrosPrato; valores: ValoresFormPrato; mensagem?: string } | undefined;

export async function salvarPratoAction(
  _estado: EstadoFormPrato,
  formData: FormData,
): Promise<EstadoFormPrato> {
  await verificarSessao();

  const id = String(formData.get("id") ?? "") || null;
  const valores = valoresDoFormulario(formData);
  const dados = lerFormularioPrato(formData);
  if (!dados.success) return { erros: errosPorCampo(dados.error), valores };

  const resultado = await salvarPrato(id, dados.data);
  if (!resultado.ok) {
    return resultado.erro === "nome_duplicado"
      ? { erros: { nome: "Já existe um prato com esse nome." }, valores }
      : { erros: {}, valores, mensagem: "Este prato não existe mais. Volte para a lista." };
  }

  revalidatePath("/pratos");
  redirect(`/pratos?aviso=salvo&nome=${encodeURIComponent(dados.data.nome)}`);
}

export async function alternarAtivoAction(id: string, ativo: boolean): Promise<void> {
  await verificarSessao();
  await definirAtivo(id, ativo);
  revalidatePath("/pratos");
}

export type EstadoRemover = { erro: string } | undefined;

// Usada com useActionState; o estado anterior não é necessário.
export async function removerPratoAction(id: string): Promise<EstadoRemover> {
  await verificarSessao();

  const resultado = await removerPrato(id);
  if (resultado.acao === "bloqueado") {
    return {
      erro: `Este prato faz parte da estrutura do buffet (${resultado.posicoes.join(", ")}). Tire-o dessa posição em Regras antes de excluir.`,
    };
  }

  revalidatePath("/pratos");
  redirect(`/pratos?aviso=${resultado.acao}`);
}
