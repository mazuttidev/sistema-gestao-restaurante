// Dados iniciais: configuração padrão, estrutura do buffet e pratos frequentes
// extraídos dos cardápios históricos (docs/ANALISE_CARDAPIOS.md).
// Uso: npx prisma db seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  type Area,
  type Categoria,
  type MetodoPreparo,
  type TipoPosicao,
} from "../src/generated/prisma/client";
import { gerarHashSenha } from "../src/lib/auth/senha";
import { normalizarNome } from "../src/lib/texto";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type PratoSeed = [nome: string, categoria: Categoria, preparo: MetodoPreparo, cubas?: number];

const PRATOS: PratoSeed[] = [
  ["Arroz branco", "ARROZ", "PANELA", 2],
  ["Arroz integral", "ARROZ", "PANELA"],
  ["Arroz à grega", "ARROZ", "PANELA"],
  ["Feijão preto", "FEIJAO", "PANELA"],
  ["Feijão carioca", "FEIJAO", "PANELA"],
  ["Feijão vermelho", "FEIJAO", "PANELA"],
  ["Feijoada", "FEIJAO", "PANELA"],
  ["Lentilha", "FEIJAO", "PANELA"],
  ["Farofa caseira", "OUTRO", "PANELA"],
  ["Batata frita", "SALGADO", "FRITADEIRA"],
  ["Pastel de carne", "SALGADO", "FRITADEIRA", 2],
  ["Bolinho de bacalhau", "SALGADO", "FRITADEIRA"],
  ["Fortaia", "SALGADO", "PANELA"],
  ["Polenta frita", "POLENTA", "FRITADEIRA"],
  ["Polenta mole", "POLENTA", "PANELA"],
  ["Polenta brustolada", "POLENTA", "GRELHA"],
  ["Polenta à milanesa", "POLENTA", "FRITADEIRA"],
  ["Massa ao molho italiano", "MASSA", "PANELA"],
  ["Espaguete ao molho napolitano", "MASSA", "PANELA"],
  ["Nhoque ao molho de frango", "MASSA", "PANELA"],
  ["Lasanha de frango", "MASSA", "FORNO"],
  ["Tortéi al pesto", "MASSA", "PANELA"],
  ["Panqueca de guisado", "MASSA", "FORNO"],
  ["Ravioli ao molho pomodoro", "MASSA", "PANELA"],
  ["Canelone de ricota", "MASSA", "FORNO"],
  ["Massa ao molho de carne picada", "MASSA", "PANELA"],
  ["Carne ao molho ferrugem", "CARNE", "PANELA"],
  ["Estrogonofe de carne", "CARNE", "PANELA"],
  ["Parmegiana de gado", "CARNE", "FORNO"],
  ["Bife de gado à milanesa", "CARNE", "FRITADEIRA"],
  ["Escalopes ao molho de cerveja", "CARNE", "PANELA"],
  ["Vaca atolada", "CARNE", "PANELA"],
  ["Cupim assado", "CARNE", "FORNO"],
  ["Maminha assada", "CARNE", "FORNO"],
  ["Carreteiro", "CARNE", "PANELA"],
  ["Frango no espeto", "FRANGO", "GRELHA"],
  ["Parmegiana de frango", "FRANGO", "FORNO"],
  ["Coxa grelhada na churrasqueira", "FRANGO", "GRELHA"],
  ["Frango à passarinho", "FRANGO", "FRITADEIRA"],
  ["Frango ao molho", "FRANGO", "PANELA"],
  ["Frango assado com limão", "FRANGO", "FORNO"],
  ["Tilápia grelhada", "PEIXE", "GRELHA"],
  ["Tilápia frita", "PEIXE", "FRITADEIRA"],
  ["Anchova grelhada com alcaparras", "PEIXE", "GRELHA"],
  ["Salmão grelhado", "PEIXE", "GRELHA"],
  ["Filé de pescada empanado", "PEIXE", "FRITADEIRA"],
  ["Peixe-rei frito", "PEIXE", "FRITADEIRA"],
  ["Peixe assado com alho-poró", "PEIXE", "FORNO"],
  ["Costela suína acebolada", "SUINO", "FORNO"],
  ["Costela suína no espeto ao alho e óleo", "SUINO", "GRELHA"],
  ["Pernil assado", "SUINO", "FORNO"],
  ["Lombo suíno com maçã", "SUINO", "FORNO"],
  ["Risoto de funghi", "RISOTO", "PANELA"],
  ["Risoto de alho-poró", "RISOTO", "PANELA"],
  ["Risoto de tomate seco e rúcula", "RISOTO", "PANELA"],
  ["Risoto de legumes", "RISOTO", "PANELA"],
  ["Couve refogada", "LEGUME", "PANELA"],
  ["Moranga refogada", "LEGUME", "PANELA"],
  ["Purê de batata", "LEGUME", "PANELA"],
  ["Aipim a vapor", "LEGUME", "PANELA"],
  ["Espinafre com ovos", "LEGUME", "PANELA"],
  ["Torta de espinafre", "LEGUME", "FORNO"],
  ["Ovos com ervilha", "LEGUME", "PANELA"],
  ["Queijo grelhado", "QUEIJO", "GRELHA"],
  ["Queijo à dorê", "QUEIJO", "FRITADEIRA"],
  ["Queijo no espeto", "QUEIJO", "GRELHA"],
  ["Queijo à milanesa", "QUEIJO", "FRITADEIRA"],
  ["Churrasco", "GRELHA", "GRELHA"],
  ["Bife de gado grelhado", "GRELHA", "GRELHA"],
  ["Queijo na grelha", "GRELHA", "GRELHA"],
  ["Hambúrguer", "GRELHA", "GRELHA"],
  ["Bife de frango", "GRELHA", "GRELHA"],
  ["Calabresa acebolada", "GRELHA", "GRELHA"],
];

type PosicaoSeed = {
  area: Area;
  ordem: number;
  nome: string;
  tipo: TipoPosicao;
  categoria?: Categoria;
  opcoes?: string[];
  dias?: number[];
};

const POSICOES: PosicaoSeed[] = [
  { area: "CUBA", ordem: 1, nome: "Arroz", tipo: "FIXA", opcoes: ["Arroz branco"] },
  {
    area: "CUBA",
    ordem: 2,
    nome: "Feijão",
    tipo: "VARIAVEL",
    opcoes: ["Feijão preto", "Feijão carioca", "Feijão vermelho", "Feijoada", "Lentilha"],
  },
  { area: "CUBA", ordem: 3, nome: "Massa", tipo: "LIVRE", categoria: "MASSA" },
  { area: "CUBA", ordem: 4, nome: "Carne", tipo: "LIVRE", categoria: "CARNE" },
  { area: "CUBA", ordem: 5, nome: "Peixe", tipo: "LIVRE", categoria: "PEIXE" },
  { area: "CUBA", ordem: 6, nome: "Frango", tipo: "LIVRE", categoria: "FRANGO" },
  { area: "CUBA", ordem: 7, nome: "Batata frita", tipo: "FIXA", opcoes: ["Batata frita"] },
  { area: "CUBA", ordem: 8, nome: "Pastel", tipo: "FIXA", opcoes: ["Pastel de carne"] },
  { area: "CUBA", ordem: 9, nome: "Queijo", tipo: "LIVRE", categoria: "QUEIJO" },
  { area: "RECHAUD", ordem: 1, nome: "Risoto", tipo: "LIVRE", categoria: "RISOTO" },
  {
    area: "RECHAUD",
    ordem: 2,
    nome: "Polenta",
    tipo: "VARIAVEL",
    opcoes: ["Polenta frita", "Polenta mole", "Polenta brustolada", "Polenta à milanesa"],
  },
  { area: "RECHAUD", ordem: 3, nome: "Legume", tipo: "LIVRE", categoria: "LEGUME" },
  { area: "RECHAUD", ordem: 4, nome: "Suíno", tipo: "LIVRE", categoria: "SUINO" },
  {
    area: "RECHAUD",
    ordem: 5,
    nome: "Arroz integral",
    tipo: "FIXA",
    opcoes: ["Arroz integral"],
  },
  { area: "RECHAUD", ordem: 6, nome: "Sobras", tipo: "SOBRAS" },
  { area: "RECHAUD", ordem: 7, nome: "Farofa", tipo: "FIXA", opcoes: ["Farofa caseira"] },
  {
    area: "GRELHA",
    ordem: 1,
    nome: "Grelha",
    tipo: "VARIAVEL",
    opcoes: ["Bife de gado grelhado", "Queijo na grelha", "Hambúrguer", "Bife de frango"],
    dias: [2, 3, 4, 5],
  },
  {
    area: "GRELHA",
    ordem: 2,
    nome: "Churrasco",
    tipo: "FIXA",
    opcoes: ["Churrasco"],
    dias: [6, 0],
  },
];

async function main() {
  await prisma.configuracao.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  const idPorNome = new Map<string, string>();
  for (const [nome, categoria, preparo, cubas = 1] of PRATOS) {
    const nomeNormalizado = normalizarNome(nome);
    const prato = await prisma.prato.upsert({
      where: { nomeNormalizado },
      update: {},
      create: { nome, nomeNormalizado, categoria, preparo, cubas },
    });
    idPorNome.set(nome, prato.id);
  }

  for (const { opcoes = [], dias = [], ...dados } of POSICOES) {
    const posicao = await prisma.posicao.upsert({
      where: { area_ordem: { area: dados.area, ordem: dados.ordem } },
      update: {},
      create: { ...dados, dias },
    });
    for (const nome of opcoes) {
      const pratoId = idPorNome.get(nome);
      if (!pratoId) throw new Error(`Opção "${nome}" da posição "${dados.nome}" não existe`);
      await prisma.posicaoOpcao.upsert({
        where: { posicaoId_pratoId: { posicaoId: posicao.id, pratoId } },
        update: {},
        create: { posicaoId: posicao.id, pratoId },
      });
    }
  }

  await criarGestor();

  console.log(`Seed concluído: ${PRATOS.length} pratos, ${POSICOES.length} posições.`);
}

/** Cria o usuário gestor a partir do .env, se ainda não existir. A senha nunca fica no código. */
async function criarGestor() {
  const { SEED_ADMIN_NOME, SEED_ADMIN_EMAIL, SEED_ADMIN_SENHA } = process.env;
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_SENHA) {
    console.log("SEED_ADMIN_EMAIL/SEED_ADMIN_SENHA não definidos: gestor não criado.");
    return;
  }
  if (SEED_ADMIN_SENHA.length < 8) throw new Error("SEED_ADMIN_SENHA precisa de 8+ caracteres");

  const email = SEED_ADMIN_EMAIL.trim().toLowerCase();
  if (await prisma.usuario.findUnique({ where: { email } })) return;
  await prisma.usuario.create({
    data: {
      nome: SEED_ADMIN_NOME?.trim() || "Gestor",
      email,
      senhaHash: await gerarHashSenha(SEED_ADMIN_SENHA),
    },
  });
  console.log(`Gestor criado: ${email}`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
