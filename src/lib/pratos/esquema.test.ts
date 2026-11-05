import { describe, expect, it } from "vitest";
import { errosPorCampo, lerFormularioPrato, valoresDoFormulario } from "./esquema";

function formulario(campos: Record<string, string | string[]>) {
  const fd = new FormData();
  for (const [chave, valor] of Object.entries(campos)) {
    for (const v of Array.isArray(valor) ? valor : [valor]) fd.append(chave, v);
  }
  return fd;
}

const valido = {
  nome: "  Feijão preto ",
  categoria: "FEIJAO",
  preparo: "PANELA",
  cubas: "1",
  ativo: "on",
  observacao: "",
};

describe("lerFormularioPrato", () => {
  it("aceita um prato válido e limpa os espaços do nome", () => {
    const r = lerFormularioPrato(formulario(valido));
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({
      nome: "Feijão preto",
      categoria: "FEIJAO",
      preparo: "PANELA",
      cubas: 1,
      ativo: true,
      restricoes: [],
      observacao: null,
    });
  });

  it("lê restrições múltiplas e o prato inativo", () => {
    const semAtivo = Object.fromEntries(
      Object.entries(valido).filter(([campo]) => campo !== "ativo"),
    );
    const r = lerFormularioPrato(formulario({ ...semAtivo, restricoes: ["VEGANO", "SEM_GLUTEN"] }));
    expect(r.data?.restricoes).toEqual(["VEGANO", "SEM_GLUTEN"]);
    expect(r.data?.ativo).toBe(false);
  });

  it("exige nome, categoria e preparo com mensagens em português", () => {
    const r = lerFormularioPrato(formulario({ nome: "a", cubas: "1" }));
    expect(r.success).toBe(false);
    const erros = errosPorCampo(r.error!);
    expect(erros.nome).toMatch(/pelo menos 2/);
    expect(erros.categoria).toBe("Escolha a categoria.");
    expect(erros.preparo).toBe("Escolha o preparo.");
  });

  it("aceita só 1 ou 2 cubas", () => {
    const r = lerFormularioPrato(formulario({ ...valido, cubas: "3" }));
    expect(errosPorCampo(r.error!).cubas).toBe("Escolha 1 ou 2 cubas.");
  });

  it("rejeita valores fora das listas", () => {
    const r = lerFormularioPrato(
      formulario({ ...valido, categoria: "SOBREMESA", restricoes: "X" }),
    );
    const erros = errosPorCampo(r.error!);
    expect(erros.categoria).toBeDefined();
    expect(erros.restricoes).toBeDefined();
  });
});

describe("valoresDoFormulario", () => {
  it("guarda o que foi digitado para reexibir o formulário após um erro", () => {
    expect(
      valoresDoFormulario(
        formulario({ ...valido, nome: "Feijão PRETO", restricoes: ["VEGANO"], cubas: "2" }),
      ),
    ).toEqual({
      nome: "Feijão PRETO",
      categoria: "FEIJAO",
      preparo: "PANELA",
      cubas: "2",
      restricoes: ["VEGANO"],
      ativo: true,
      observacao: "",
    });
  });

  it("usa vazio para campos não enviados", () => {
    expect(valoresDoFormulario(new FormData())).toEqual({
      nome: "",
      categoria: "",
      preparo: "",
      cubas: "1",
      restricoes: [],
      ativo: false,
      observacao: "",
    });
  });
});
