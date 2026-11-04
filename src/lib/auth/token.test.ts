import { describe, expect, it } from "vitest";
import { assinarToken, verificarToken } from "./token";

const SEGREDO = "segredo-de-teste-com-pelo-menos-32-caracteres";

describe("token de sessão", () => {
  it("devolve o usuário de um token válido", async () => {
    const token = await assinarToken({ usuarioId: "u1" }, SEGREDO, 60);
    expect(await verificarToken(token, SEGREDO)).toEqual({ usuarioId: "u1" });
  });

  it("rejeita token assinado com outro segredo", async () => {
    const token = await assinarToken({ usuarioId: "u1" }, SEGREDO, 60);
    expect(await verificarToken(token, `${SEGREDO}-outro`)).toBeNull();
  });

  it("rejeita token expirado", async () => {
    const token = await assinarToken({ usuarioId: "u1" }, SEGREDO, -10);
    expect(await verificarToken(token, SEGREDO)).toBeNull();
  });

  it("rejeita token ausente ou malformado", async () => {
    expect(await verificarToken(undefined, SEGREDO)).toBeNull();
    expect(await verificarToken("abc", SEGREDO)).toBeNull();
  });
});
