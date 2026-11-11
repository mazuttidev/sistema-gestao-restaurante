"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verificarSessao } from "@/lib/auth/dal";
import { removerPosicao, salvarConfiguracao, salvarPosicao } from "@/lib/regras/dados";
import {
  errosPorCampo,
  lerFormularioConfiguracao,
  lerFormularioPosicao,
  type ErrosConfiguracao,
  type ErrosPosicao,
} from "@/lib/regras/esquema";
import { ROTULO_AREA } from "@/lib/regras/rotulos";

export type EstadoFormConfiguracao = { erros: ErrosConfiguracao; salvo?: boolean } | undefined;

export async function salvarConfiguracaoAction(
  _estado: EstadoFormConfiguracao,
  formData: FormData,
): Promise<EstadoFormConfiguracao> {
  await verificarSessao();

  const dados = lerFormularioConfiguracao(formData);
  if (!dados.success) return { erros: errosPorCampo<keyof ErrosConfiguracao>(dados.error) };

  await salvarConfiguracao(dados.data);
  revalidatePath("/regras");
  revalidatePath("/semana");
  return { erros: {}, salvo: true };
}

export type EstadoFormPosicao = { erros: ErrosPosicao; mensagem?: string } | undefined;

export async function salvarPosicaoAction(
  _estado: EstadoFormPosicao,
  formData: FormData,
): Promise<EstadoFormPosicao> {
  await verificarSessao();

  const id = String(formData.get("id") ?? "") || null;
  const dados = lerFormularioPosicao(formData);
  if (!dados.success) return { erros: errosPorCampo<keyof ErrosPosicao>(dados.error) };

  const resultado = await salvarPosicao(id, dados.data);
  if (!resultado.ok) {
    if (resultado.erro === "ordem_duplicada") {
      const { area, ordem } = dados.data;
      return {
        erros: {
          ordem: `Já existe ${ROTULO_AREA[area].toLowerCase()} ${ordem}. Use outro número.`,
        },
      };
    }
    return {
      erros: {},
      mensagem:
        resultado.erro === "nao_encontrado"
          ? "Esta posição não existe mais. Volte para Regras."
          : "Um dos pratos escolhidos não existe mais. Recarregue a página.",
    };
  }

  revalidatePath("/regras");
  redirect(`/regras?aviso=posicao_salva&nome=${encodeURIComponent(dados.data.nome)}`);
}

export async function removerPosicaoAction(id: string): Promise<void> {
  await verificarSessao();
  const resultado = await removerPosicao(id);
  revalidatePath("/regras");
  redirect(`/regras?aviso=posicao_${resultado.acao}`);
}
