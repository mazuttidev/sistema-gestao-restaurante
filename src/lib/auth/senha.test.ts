import { describe, expect, it } from "vitest";
import { gerarHashSenha, verificarSenha } from "./senha";

describe("senha", () => {
  it("aceita a senha correta", async () => {
    const hash = await gerarHashSenha("cardapio-certo");
    expect(await verificarSenha("cardapio-certo", hash)).toBe(true);
  });

  it("rejeita senha errada", async () => {
    const hash = await gerarHashSenha("cardapio-certo");
    expect(await verificarSenha("outra-senha", hash)).toBe(false);
  });

  it("não guarda a senha em texto e usa sal aleatório", async () => {
    const a = await gerarHashSenha("mesma");
    const b = await gerarHashSenha("mesma");
    expect(a).not.toContain("mesma");
    expect(a).not.toBe(b);
    expect(a.startsWith("scrypt$")).toBe(true);
  });

  it("rejeita hash em formato inválido sem lançar erro", async () => {
    expect(await verificarSenha("qualquer", "invalido")).toBe(false);
  });
});
