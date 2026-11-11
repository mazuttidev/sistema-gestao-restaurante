"use client";

import { useActionState, useState } from "react";
import { NOMES_DIAS_SEMANA } from "@/lib/gerador/datas";
import { DIA_CURTO, DIAS_ORDENADOS } from "@/lib/regras/rotulos";
import { salvarConfiguracaoAction, type EstadoFormConfiguracao } from "./actions";
import { ErroCampo, opcaoSegmentada } from "./ui";

type Configuracao = {
  diasFuncionamento: number[];
  maxFritosDia: number;
  semanasSemRepetir: number;
  naoRepetirDiasSeguidos: boolean;
};

// Campos controlados: o React limpa formulários não controlados após a action, e o
// gestor perderia o que mudou quando houver erro.
export function FormConfiguracao({ configuracao }: { configuracao: Configuracao }) {
  const [estado, acao, salvando] = useActionState<EstadoFormConfiguracao, FormData>(
    salvarConfiguracaoAction,
    undefined,
  );
  const [dias, setDias] = useState(configuracao.diasFuncionamento);
  const [maxFritos, setMaxFritos] = useState(String(configuracao.maxFritosDia));
  const [semanas, setSemanas] = useState(String(configuracao.semanasSemRepetir));
  const [diasSeguidos, setDiasSeguidos] = useState(configuracao.naoRepetirDiasSeguidos);
  const erros = estado?.erros ?? {};

  const alternarDia = (dia: number) =>
    setDias((atuais) =>
      atuais.includes(dia) ? atuais.filter((d) => d !== dia) : [...atuais, dia],
    );

  return (
    <form action={acao} className="cartao flex flex-col gap-6 p-4 md:p-6" noValidate>
      <h2 className="text-lg font-bold">Regras gerais</h2>

      <fieldset className="flex flex-col gap-1.5" aria-describedby="erro-dias">
        <legend className="mb-1.5 font-semibold">Dias de funcionamento</legend>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {DIAS_ORDENADOS.map((dia) => (
            <label key={dia} className={opcaoSegmentada}>
              <input
                type="checkbox"
                name="diasFuncionamento"
                value={dia}
                checked={dias.includes(dia)}
                onChange={() => alternarDia(dia)}
                className="sr-only"
              />
              <span aria-hidden>{DIA_CURTO[dia]}</span>
              <span className="sr-only">{NOMES_DIAS_SEMANA[dia]}</span>
            </label>
          ))}
        </div>
        <ErroCampo id="erro-dias" erro={erros.diasFuncionamento} />
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="maxFritosDia" className="font-semibold">
            Limite de fritos por dia
          </label>
          <input
            id="maxFritosDia"
            name="maxFritosDia"
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={maxFritos}
            onChange={(e) => setMaxFritos(e.target.value)}
            aria-invalid={erros.maxFritosDia ? true : undefined}
            aria-describedby="dica-fritos erro-fritos"
            className="campo w-28"
          />
          <p id="dica-fritos" className="text-suave text-sm">
            Conta tudo que vai na fritadeira, inclusive os fixos (batata, pastel).
          </p>
          <ErroCampo id="erro-fritos" erro={erros.maxFritosDia} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="semanasSemRepetir" className="font-semibold">
            Não repetir pratos das últimas
          </label>
          <div className="flex items-center gap-2">
            <input
              id="semanasSemRepetir"
              name="semanasSemRepetir"
              type="number"
              inputMode="numeric"
              min={0}
              max={8}
              value={semanas}
              onChange={(e) => setSemanas(e.target.value)}
              aria-invalid={erros.semanasSemRepetir ? true : undefined}
              aria-describedby="dica-semanas erro-semanas"
              className="campo w-28"
            />
            <span>semana(s)</span>
          </div>
          <p id="dica-semanas" className="text-suave text-sm">
            Vale para as posições livres (massa, carne…). Use 0 para desligar.
          </p>
          <ErroCampo id="erro-semanas" erro={erros.semanasSemRepetir} />
        </div>
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 font-semibold">
        <input
          type="checkbox"
          name="naoRepetirDiasSeguidos"
          checked={diasSeguidos}
          onChange={(e) => setDiasSeguidos(e.target.checked)}
          className="accent-primaria size-5"
        />
        Não repetir o mesmo prato em dias seguidos
      </label>

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        {estado?.salvo && (
          <p role="status" className="text-ok font-semibold">
            Regras salvas.
          </p>
        )}
        <button type="submit" disabled={salvando} className="botao-primario">
          {salvando ? "Salvando…" : "Salvar regras"}
        </button>
      </div>
    </form>
  );
}
