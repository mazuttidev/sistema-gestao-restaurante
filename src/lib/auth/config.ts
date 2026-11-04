// Configuração da sessão compartilhada entre o proxy e o servidor.

export const COOKIE_SESSAO = "sessao";
export const DURACAO_SESSAO_SEGUNDOS = 7 * 24 * 60 * 60;

export function segredoSessao(): string {
  const segredo = process.env.AUTH_SECRET;
  if (!segredo || segredo.length < 32) {
    throw new Error("AUTH_SECRET ausente ou curto: defina pelo menos 32 caracteres no .env");
  }
  return segredo;
}
