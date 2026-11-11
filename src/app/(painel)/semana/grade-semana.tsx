"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Lock, LockOpen, RefreshCw, TriangleAlert, X } from "lucide-react";
import { BadgePreparo } from "@/components/pratos/badge-preparo";
import type { ResumoDia } from "@/lib/gerador/analise";
import { diaMes, nomeDoDia, type DataISO } from "@/lib/gerador/datas";
import type { Alerta, PosicaoGerador, RegrasGerador } from "@/lib/gerador/tipos";
import { ROTULO_CATEGORIA } from "@/lib/pratos/rotulos";
import { ROTULO_AREA } from "@/lib/regras/rotulos";
import type { ItemDaSemana, PratoDaSemana } from "@/lib/semana/dados";
import { normalizarNome } from "@/lib/texto";
import {
  definirTravadoAction,
  regenerarDiaAction,
  trocarPratoAction,
  type RespostaSemana,
} from "./actions";

type Props = {
  semanaInicio: DataISO;
  dias: DataISO[];
  regras: RegrasGerador;
  pratos: PratoDaSemana[];
  posicoes: PosicaoGerador[];
  itens: ItemDaSemana[];
  resumo: ResumoDia[];
  editavel: boolean;
};

type Celula = { data: DataISO; posicao: PosicaoGerador; item?: ItemDaSemana };

/** Executa uma action e guarda a mensagem de erro, se houver. */
function useAcao() {
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string>();
  const executar = (acao: () => Promise<RespostaSemana>, aoConcluir?: () => void) =>
    iniciar(async () => {
      const resposta = await acao();
      setErro(resposta.erro);
      if (!resposta.erro) aoConcluir?.();
    });
  return { pendente, erro, executar };
}

export function GradeSemana(props: Props) {
  const { dias, pratos, posicoes, itens, resumo, editavel } = props;
  const pratoPorId = useMemo(() => new Map(pratos.map((p) => [p.id, p])), [pratos]);
  const itemPor = useMemo(
    () => new Map(itens.map((i) => [`${i.data}|${i.posicaoId}`, i])),
    [itens],
  );
  const alertasPor = useMemo(() => {
    const mapa = new Map<string, Alerta[]>();
    for (const dia of resumo) {
      for (const alerta of dia.alertas) {
        if (!alerta.posicaoId) continue;
        const chave = `${alerta.data}|${alerta.posicaoId}`;
        mapa.set(chave, [...(mapa.get(chave) ?? []), alerta]);
      }
    }
    return mapa;
  }, [resumo]);

  const [editando, setEditando] = useState<Celula | null>(null);
  const [diaMovel, setDiaMovel] = useState(dias[0]);
  const dialogo = useRef<HTMLDialogElement>(null);

  const abrir = (celula: Celula) => {
    if (!editavel) return;
    setEditando(celula);
    dialogo.current?.showModal();
  };
  const fechar = () => {
    dialogo.current?.close();
    setEditando(null);
  };

  const celula = (data: DataISO, posicao: PosicaoGerador) => {
    const chave = `${data}|${posicao.id}`;
    const item = itemPor.get(chave);
    return (
      <CelulaPrato
        item={item}
        prato={item?.pratoId ? pratoPorId.get(item.pratoId) : undefined}
        alertas={alertasPor.get(chave) ?? []}
        rotulo={`${posicao.nome}, ${nomeDoDia(data)} ${diaMes(data)}`}
        editavel={editavel}
        onClick={() => abrir({ data, posicao, item })}
      />
    );
  };

  const existeNoDia = (posicao: PosicaoGerador, data: DataISO) =>
    itemPor.has(`${data}|${posicao.id}`);

  return (
    <>
      <ResumoSemana {...props} />

      {/* Celular: um dia por vez. */}
      <div className="md:hidden">
        <div role="tablist" aria-label="Dias da semana" className="mb-3 flex gap-2 overflow-x-auto">
          {dias.map((data) => {
            const alertas = resumo.find((r) => r.data === data)?.alertas.length ?? 0;
            return (
              <button
                key={data}
                role="tab"
                type="button"
                aria-selected={diaMovel === data}
                onClick={() => setDiaMovel(data)}
                className="border-borda aria-selected:border-primaria aria-selected:bg-primaria-clara flex min-h-11 shrink-0 flex-col items-center rounded-lg border px-3 py-1 font-semibold"
              >
                <span>{nomeDoDia(data).slice(0, 3)}</span>
                <span className="text-suave text-xs">
                  {diaMes(data)}
                  {alertas > 0 && (
                    <span className="text-alerta">
                      {" "}
                      · {alertas} alerta{alertas > 1 ? "s" : ""}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <ul role="tabpanel" className="cartao divide-borda divide-y">
          {posicoes
            .filter((p) => existeNoDia(p, diaMovel))
            .map((posicao) => (
              <li key={posicao.id} className="flex items-center gap-3 p-2">
                <span className="text-suave w-24 shrink-0 text-sm">{posicao.nome}</span>
                <div className="min-w-0 flex-1">{celula(diaMovel, posicao)}</div>
              </li>
            ))}
        </ul>
      </div>

      {/* Desktop: grade posições × dias. */}
      <div className="cartao hidden overflow-x-auto md:block">
        <table className="w-full min-w-[56rem] table-fixed text-left text-sm">
          <caption className="sr-only">
            Cardápio da semana: posições do buffet nas linhas e dias nas colunas
          </caption>
          <thead className="bg-fundo">
            <tr>
              <th scope="col" className="w-36 px-3 py-2 font-semibold">
                Posição
              </th>
              {dias.map((data) => (
                <th key={data} scope="col" className="px-2 py-2 font-semibold">
                  {nomeDoDia(data)}
                  <span className="text-suave block text-xs font-normal">{diaMes(data)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-borda divide-y">
            {posicoes.map((posicao) => (
              <tr key={posicao.id}>
                <th scope="row" className="px-3 py-1 align-middle font-semibold">
                  {posicao.nome}
                  <span className="text-suave block text-xs font-normal">
                    {ROTULO_AREA[posicao.area]} {posicao.ordem}
                  </span>
                </th>
                {dias.map((data) => (
                  <td key={data} className="p-1 align-top">
                    {existeNoDia(posicao, data) ? (
                      celula(data, posicao)
                    ) : (
                      <span className="text-suave block p-2 text-center">
                        <span aria-hidden>—</span>
                        <span className="sr-only">Não existe neste dia</span>
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog
        ref={dialogo}
        onClose={() => setEditando(null)}
        aria-labelledby="titulo-editor"
        className="bg-superficie text-texto m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl p-0 shadow-xl backdrop:bg-black/40"
      >
        {editando && (
          <EditorItem
            key={`${editando.data}|${editando.posicao.id}`}
            {...props}
            celula={editando}
            onFechar={fechar}
          />
        )}
      </dialog>
    </>
  );
}

function CelulaPrato({
  item,
  prato,
  alertas,
  rotulo,
  editavel,
  onClick,
}: {
  item?: ItemDaSemana;
  prato?: PratoDaSemana;
  alertas: Alerta[];
  rotulo: string;
  editavel: boolean;
  onClick: () => void;
}) {
  const temAlerta = alertas.length > 0;
  const conteudo = (
    <>
      <span className="flex w-full items-start gap-1">
        <span className={`flex-1 font-semibold ${prato ? "" : "text-suave italic"}`}>
          {prato?.nome ?? "Vazio"}
        </span>
        {item?.travado && <Lock aria-label="Travado" className="text-suave mt-0.5 size-3.5" />}
        {temAlerta && <TriangleAlert aria-hidden className="text-alerta mt-0.5 size-3.5" />}
      </span>
      {prato && prato.preparo !== "PANELA" && prato.preparo !== "NENHUM" && (
        <BadgePreparo preparo={prato.preparo} />
      )}
      {temAlerta && (
        <span className="sr-only">Alerta: {alertas.map((a) => a.mensagem).join(" ")}</span>
      )}
    </>
  );
  const classe = `flex w-full flex-col items-start gap-1 rounded-lg border p-2 text-left ${
    temAlerta ? "border-alerta/50 bg-alerta/5" : "border-transparent"
  }`;

  if (!editavel) return <div className={classe}>{conteudo}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Trocar ${rotulo}: ${prato?.nome ?? "vazio"}${item?.travado ? ", travado" : ""}${
        temAlerta ? `. Alerta: ${alertas.map((a) => a.mensagem).join(" ")}` : ""
      }`}
      title={temAlerta ? alertas.map((a) => a.mensagem).join("\n") : undefined}
      className={`${classe} hover:border-primaria focus-visible:ring-primaria/30 outline-none focus-visible:ring-4`}
    >
      {conteudo}
    </button>
  );
}

function ResumoSemana({ semanaInicio, dias, resumo, regras, editavel }: Props) {
  const { pendente, erro, executar } = useAcao();
  const [regenerando, setRegenerando] = useState<DataISO>();

  return (
    <section aria-label="Indicadores por dia" className="mb-4">
      {erro && (
        <p role="alert" className="text-erro mb-2 font-semibold">
          {erro}
        </p>
      )}
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
        {dias.map((data) => {
          const dia = resumo.find((r) => r.data === data);
          if (!dia) return null;
          const passou = dia.fritos > regras.maxFritosDia;
          const alertasDia = dia.alertas.filter((a) => a.tipo !== "limite_fritos");
          return (
            <li
              key={data}
              className="cartao flex w-44 shrink-0 flex-col gap-1 p-3 text-sm sm:w-auto"
            >
              <p className="font-bold">
                {nomeDoDia(data)} <span className="text-suave font-normal">{diaMes(data)}</span>
              </p>
              <p className={passou ? "text-alerta font-semibold" : undefined}>
                {passou && <TriangleAlert aria-hidden className="mr-1 inline size-4" />}
                Fritos: {dia.fritos} de {regras.maxFritosDia}
                {passou && <span className="sr-only"> (acima do limite)</span>}
              </p>
              <p className="text-suave">
                Forno {dia.porPreparo.FORNO} · Grelha {dia.porPreparo.GRELHA} · Fritad.{" "}
                {dia.porPreparo.FRITADEIRA}
              </p>
              {alertasDia.length > 0 ? (
                <details className="text-alerta">
                  <summary className="cursor-pointer font-semibold">
                    {alertasDia.length} alerta{alertasDia.length > 1 ? "s" : ""}
                  </summary>
                  <ul className="mt-1 list-disc pl-4">
                    {alertasDia.map((a, i) => (
                      <li key={i}>{a.mensagem}</li>
                    ))}
                  </ul>
                </details>
              ) : (
                !passou && <p className="text-ok font-semibold">Dentro das regras</p>
              )}
              {editavel && (
                <button
                  type="button"
                  disabled={pendente}
                  onClick={() => {
                    setRegenerando(data);
                    executar(() => regenerarDiaAction(semanaInicio, data));
                  }}
                  className="text-primaria mt-1 inline-flex min-h-9 items-center gap-1 self-start font-semibold disabled:opacity-60"
                >
                  <RefreshCw
                    aria-hidden
                    className={`size-4 ${pendente && regenerando === data ? "animate-spin" : ""}`}
                  />
                  Regenerar dia
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function EditorItem({
  semanaInicio,
  dias,
  pratos,
  itens,
  celula,
  onFechar,
}: Props & { celula: Celula; onFechar: () => void }) {
  const { data, posicao, item } = celula;
  const { pendente, erro, executar } = useAcao();
  const [busca, setBusca] = useState("");

  const indice = dias.indexOf(data);
  const vizinhos = new Set([dias[indice - 1], dias[indice + 1]].filter(Boolean));
  const servidoAoLado = new Set(
    itens.filter((i) => vizinhos.has(i.data) && i.pratoId).map((i) => i.pratoId),
  );
  const noMesmoDia = new Set(
    itens.filter((i) => i.data === data && i.posicaoId !== posicao.id).map((i) => i.pratoId),
  );

  const sugerido = (p: PratoDaSemana) =>
    posicao.tipo === "LIVRE" ? p.categoria === posicao.categoria : posicao.opcoes.includes(p.id);
  const termo = normalizarNome(busca);
  const visiveis = pratos.filter(
    (p) =>
      (p.ativo || p.id === item?.pratoId) &&
      (termo ? normalizarNome(p.nome).includes(termo) : sugerido(p)),
  );

  return (
    <div className="flex max-h-[85dvh] flex-col">
      <header className="border-borda flex items-start gap-2 border-b p-4">
        <div className="flex-1">
          <h2 id="titulo-editor" className="text-lg font-bold">
            {posicao.nome}
          </h2>
          <p className="text-suave text-sm">
            {ROTULO_AREA[posicao.area]} {posicao.ordem} · {nomeDoDia(data)} {diaMes(data)}
          </p>
        </div>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="hover:bg-fundo flex size-11 items-center justify-center rounded-lg"
        >
          <X aria-hidden className="size-5" />
        </button>
      </header>

      <div className="flex flex-col gap-3 overflow-y-auto p-4">
        {erro && (
          <p role="alert" className="text-erro font-semibold">
            {erro}
          </p>
        )}

        {item && (
          <button
            type="button"
            disabled={pendente}
            onClick={() =>
              executar(() => definirTravadoAction(semanaInicio, item.id, !item.travado), onFechar)
            }
            className="botao-secundario self-start"
          >
            {item.travado ? (
              <>
                <LockOpen aria-hidden className="size-5" /> Destravar (o gerador pode trocar)
              </>
            ) : (
              <>
                <Lock aria-hidden className="size-5" /> Travar (manter ao regenerar)
              </>
            )}
          </button>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="busca-editor" className="font-semibold">
            Trocar por
          </label>
          <input
            id="busca-editor"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar qualquer prato…"
            className="campo"
          />
          <p className="text-suave text-sm">
            {termo
              ? "Mostrando todos os pratos com esse nome."
              : posicao.tipo === "LIVRE" && posicao.categoria
                ? `Sugestões: pratos de ${ROTULO_CATEGORIA[posicao.categoria].toLowerCase()}. Busque para ver outros.`
                : "Sugestões desta posição. Busque para ver outros pratos."}
          </p>
        </div>

        <ul className="border-borda divide-borda divide-y rounded-lg border">
          {visiveis.map((prato) => {
            const avisos = [
              servidoAoLado.has(prato.id) && "servido no dia vizinho",
              noMesmoDia.has(prato.id) && "já está neste dia",
              !prato.ativo && "inativo",
            ].filter(Boolean);
            const atual = prato.id === item?.pratoId;
            return (
              <li key={prato.id}>
                <button
                  type="button"
                  disabled={pendente || atual}
                  onClick={() =>
                    executar(
                      () => trocarPratoAction(semanaInicio, data, posicao.id, prato.id),
                      onFechar,
                    )
                  }
                  className="hover:bg-fundo flex min-h-11 w-full flex-wrap items-center gap-2 px-3 py-2 text-left disabled:cursor-default"
                >
                  <span className="flex-1 font-semibold">
                    {prato.nome}
                    {atual && <span className="text-suave font-normal"> (atual)</span>}
                  </span>
                  <BadgePreparo preparo={prato.preparo} />
                  {avisos.length > 0 && (
                    <span className="text-alerta flex w-full items-center gap-1 text-xs font-semibold">
                      <TriangleAlert aria-hidden className="size-3.5" />
                      {avisos.join(" · ")}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {visiveis.length === 0 && <li className="text-suave p-3">Nenhum prato encontrado.</li>}
        </ul>

        {item?.pratoId && (
          <button
            type="button"
            disabled={pendente}
            onClick={() =>
              executar(() => trocarPratoAction(semanaInicio, data, posicao.id, null), onFechar)
            }
            className="text-suave min-h-11 self-start font-semibold underline"
          >
            Deixar esta posição vazia
          </button>
        )}
        <p className="text-suave text-xs">
          Pratos trocados à mão ficam travados e não mudam ao regenerar.
        </p>
      </div>
    </div>
  );
}
