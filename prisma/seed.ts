// Consolidação dos pratos: docs/importacao-pratos/relatorio.md.
// Uso: npx prisma db seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PRATOS, POSICOES } from "./dados-iniciais";
import { gerarHashSenha } from "../src/lib/auth/senha";
import { normalizarNome } from "../src/lib/texto";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  await prisma.configuracao.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  const idPorNome = new Map<string, string>();
  for (const dados of PRATOS) {
    const nomeNormalizado = normalizarNome(dados.nome);
    const prato = await prisma.prato.upsert({
      where: { nomeNormalizado },
      update: {},
      create: { ...dados, nomeNormalizado },
    });
    idPorNome.set(normalizarNome(dados.nome), prato.id);
  }

  for (const { opcoes = [], dias = [], ...dados } of POSICOES) {
    const posicao = await prisma.posicao.upsert({
      where: { area_ordem: { area: dados.area, ordem: dados.ordem } },
      update: {},
      create: { ...dados, dias },
    });
    for (const nome of opcoes) {
      const pratoId = idPorNome.get(normalizarNome(nome));
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
