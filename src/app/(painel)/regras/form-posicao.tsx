"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import type { Area as TArea, TipoPosicao as TTipo } from "@/generated/prisma/enums";
import { NOMES_DIAS_SEMANA } from "@/lib/gerador/datas";
import { Categoria, ROTULO_CATEGORIA } from "@/lib/pratos/rotulos";
import type { PosicaoCompleta, PratoOpcao } from "@/lib/regras/dados";
import {
  Area,
  DESCRICAO_TIPO_POSICAO,
  DIA_CURTO,
  DIAS_ORDENADOS,
  ROTULO_AREA,
  ROTULO_TIPO_POSICAO,
  TipoPosicao,
} from "@/lib/regras/rotulos";
import { normalizarNome } from "@/lib/texto";
import { salvarPosicaoAction, type EstadoFormPosicao } from "./actions";
import { ErroCampo, opcaoSegmentada } from "./ui";

type Props = {
  posicao?: PosicaoCompleta;
  pratos: PratoOpcao[];
  areaInicial?: TArea;
  ordemInicial?: number;
  diasFuncionamento: number[];
};

// Campos controlados: o React limpa formulários não controlados após a action.
export function FormPosicao({
  posicao,
  pratos,
  areaInicial = "CUBA",
  ordemInicial = 1,
  diasFuncionamento,
}: Props) {
  const [estado, acao, salvando] = useActionState<EstadoFormPosicao, FormData>(
    salvarPosicaoAction,
    undefined,
  );
  const erros = estado?.erros ?? {};

  const [nome, setNome] = useState(posicao?.nome ?? "");
  const [area, setArea] = useState<TArea>(posicao?.area ?? areaInicial);
  const [ordem, setOrdem] = useState(String(posicao?.ordem ?? ordemInicial));
  const [tipo, setTipo] = useState<TTipo>(posicao?.tipo ?? "LIVRE");
  const [categoria, setCategoria] = useState<string>(posicao?.categoria ?? "");
  const [opcoes, setOpcoes] = useState<string[]>(posicao?.opcoes.map((o) => o.prato.id) ?? []);
  const [dias, setDias] = useState<number[]>(posicao?.dias ?? []);
  const [ativa, setAtiva] = useState(posicao?.ativa ?? true);
  const [busca, setBusca] = useState("");

  const usaOpcoes = tipo === "FIXA" || tipo === "VARIAVEL";

  const pratosFiltrados = useMemo(() => {
    const termo = normalizarNome(busca);
    return pratos.filter(
      (p) => opcoes.includes(p.id) || !termo || normalizarNome(p.nome).includes(termo),
    );
  }, [pratos, busca, opcoes]);

  const alternarOpcao = (id: string) => {
    if (tipo === "FIXA") setOpcoes([id]);
    else
      setOpcoes((atuais) =>
        atuais.includes(id) ? atuais.filter((o) => o !== id) : [...atuais, id],
      );
  };

  const alternarDia = (dia: number) =>
    setDias((atuais) =>
      atuais.includes(dia) ? atuais.filter((d) => d !== dia) : [...atuais, dia],
    );

  const nomesEscolhidos = pratos.filter((p) => opcoes.includes(p.id)).map((p) => p.nome);

  return (
    <form action={acao} className="cartao flex flex-col gap-6 p-4 md:p-6" noValidate>
      {posicao && <input type="hidden" name="id" value={posicao.id} />}

      {estado?.mensagem && (
        <p role="alert" className="text-erro font-semibold">
          {estado.mensagem}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="font-semibold">
          Nome da posição
        </label>
        <input
          id="nome"
          name="nome"
          required
          maxLength={40}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Massa, Feijão, Sobras"
          aria-invalid={erros.nome ? true : undefined}
          aria-describedby={erros.nome ? "erro-nome" : undefined}
          className="campo"
        />
        <ErroCampo id="erro-nome" erro={erros.nome} />
      </div>

      <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 font-semibold">Área do buffet</legend>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(Area).map((a) => (
              <label key={a} className={opcaoSegmentada}>
                <input
                  type="radio"
                  name="area"
                  value={a}
                  checked={area === a}
                  onChange={() => setArea(a)}
                  className="sr-only"
                />
                {ROTULO_AREA[a]}
              </label>
            ))}
          </div>
          <ErroCampo id="erro-area" erro={erros.area} />
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ordem" className="font-semibold">
            Número
          </label>
          <input
            id="ordem"
            name="ordem"
            type="number"
            inputMode="numeric"
            min={1}
            max={30}
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            aria-invalid={erros.ordem ? true : undefined}
            aria-describedby={erros.ordem ? "erro-ordem" : undefined}
            className="campo w-28"
          />
          <ErroCampo id="erro-ordem" erro={erros.ordem} />
        </div>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 font-semibold">Como o gerador preenche</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.values(TipoPosicao).map((t) => (
            <label
              key={t}
              className={`${opcaoSegmentada} flex-col items-start! justify-start! gap-0.5 py-2 text-left!`}
            >
              <input
                type="radio"
                name="tipo"
                value={t}
                checked={tipo === t}
                onChange={() => {
                  setTipo(t);
                  if (t === "FIXA") setOpcoes((atuais) => atuais.slice(0, 1));
                }}
                className="sr-only"
              />
              <span>{ROTULO_TIPO_POSICAO[t]}</span>
              <span className="text-suave text-sm font-normal">{DESCRICAO_TIPO_POSICAO[t]}</span>
            </label>
          ))}
        </div>
        <ErroCampo id="erro-tipo" erro={erros.tipo} />
      </fieldset>

      {tipo === "LIVRE" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoria" className="font-semibold">
            Categoria
          </label>
          <select
            id="categoria"
            name="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            aria-invalid={erros.categoria ? true : undefined}
            aria-describedby={erros.categoria ? "erro-categoria" : undefined}
            className="campo"
          >
            <option value="" disabled>
              Escolha…
            </option>
            {Object.values(Categoria).map((c) => (
              <option key={c} value={c}>
                {ROTULO_CATEGORIA[c]}
              </option>
            ))}
          </select>
          <ErroCampo id="erro-categoria" erro={erros.categoria} />
        </div>
      )}

      {usaOpcoes && (
        <fieldset
          className="flex flex-col gap-2"
          aria-describedby={erros.opcoes ? "erro-opcoes" : "resumo-opcoes"}
        >
          <legend className="mb-1.5 font-semibold">
            {tipo === "FIXA" ? "Prato desta posição" : "Pratos que se alternam"}
          </legend>
          <p id="resumo-opcoes" className="text-suave text-sm" aria-live="polite">
            {nomesEscolhidos.length === 0
              ? "Nenhum prato escolhido."
              : `Escolhido${nomesEscolhidos.length > 1 ? "s" : ""}: ${nomesEscolhidos.join(", ")}.`}
          </p>
          <ErroCampo id="erro-opcoes" erro={erros.opcoes} />
          <label htmlFor="busca-pratos" className="sr-only">
            Buscar prato
          </label>
          <input
            id="busca-pratos"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar prato…"
            className="campo"
          />
          <ul className="border-borda max-h-72 overflow-y-auto rounded-lg border">
            {pratosFiltrados.map((prato) => (
              <li key={prato.id} className="border-borda border-b last:border-b-0">
                <label className="hover:bg-fundo flex min-h-11 cursor-pointer items-center gap-3 px-3">
                  <input
                    type={tipo === "FIXA" ? "radio" : "checkbox"}
                    name="opcoes"
                    value={prato.id}
                    checked={opcoes.includes(prato.id)}
                    onChange={() => alternarOpcao(prato.id)}
                    className="accent-primaria size-5"
                  />
                  <span className="flex-1">
                    {prato.nome}
                    {!prato.ativo && <span className="text-suave text-sm"> (inativo)</span>}
                  </span>
                  <span className="text-suave text-sm">{ROTULO_CATEGORIA[prato.categoria]}</span>
                </label>
              </li>
            ))}
            {pratosFiltrados.length === 0 && (
              <li className="text-suave p-3">Nenhum prato com esse nome.</li>
            )}
          </ul>
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-1.5" aria-describedby="dica-dias">
        <legend className="mb-1.5 font-semibold">Dias em que a posição existe</legend>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {DIAS_ORDENADOS.filter((d) => diasFuncionamento.includes(d)).map((dia) => (
            <label key={dia} className={opcaoSegmentada}>
              <input
                type="checkbox"
                name="dias"
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
        <p id="dica-dias" className="text-suave text-sm">
          Nenhum marcado = todos os dias de funcionamento.
        </p>
        <ErroCampo id="erro-dias" erro={erros.dias} />
      </fieldset>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 font-semibold">
        <input
          type="checkbox"
          name="ativa"
          checked={ativa}
          onChange={(e) => setAtiva(e.target.checked)}
          className="accent-primaria size-5"
        />
        Ativa (entra nos próximos cardápios)
      </label>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href="/regras" className="botao-secundario">
          Cancelar
        </Link>
        <button type="submit" disabled={salvando} className="botao-primario">
          {salvando ? "Salvando…" : "Salvar posição"}
        </button>
      </div>
    </form>
  );
}
