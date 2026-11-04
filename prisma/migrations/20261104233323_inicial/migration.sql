-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('ARROZ', 'FEIJAO', 'MASSA', 'CARNE', 'FRANGO', 'PEIXE', 'SUINO', 'RISOTO', 'POLENTA', 'LEGUME', 'SALGADO', 'QUEIJO', 'GRELHA', 'OUTRO');

-- CreateEnum
CREATE TYPE "MetodoPreparo" AS ENUM ('FORNO', 'GRELHA', 'FRITADEIRA', 'PANELA', 'NENHUM');

-- CreateEnum
CREATE TYPE "Restricao" AS ENUM ('SEM_LACTOSE', 'SEM_GLUTEN', 'VEGANO', 'VEGETARIANO');

-- CreateEnum
CREATE TYPE "Area" AS ENUM ('CUBA', 'RECHAUD', 'GRELHA');

-- CreateEnum
CREATE TYPE "TipoPosicao" AS ENUM ('FIXA', 'VARIAVEL', 'LIVRE', 'SOBRAS');

-- CreateEnum
CREATE TYPE "StatusCardapio" AS ENUM ('RASCUNHO', 'HOMOLOGADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prato" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nomeNormalizado" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "preparo" "MetodoPreparo" NOT NULL,
    "cubas" INTEGER NOT NULL DEFAULT 1,
    "restricoes" "Restricao"[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posicao" (
    "id" TEXT NOT NULL,
    "area" "Area" NOT NULL,
    "ordem" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoPosicao" NOT NULL,
    "categoria" "Categoria",
    "dias" INTEGER[],
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Posicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosicaoOpcao" (
    "posicaoId" TEXT NOT NULL,
    "pratoId" TEXT NOT NULL,

    CONSTRAINT "PosicaoOpcao_pkey" PRIMARY KEY ("posicaoId","pratoId")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "diasFuncionamento" INTEGER[] DEFAULT ARRAY[2, 3, 4, 5, 6, 0]::INTEGER[],
    "maxFritosDia" INTEGER NOT NULL DEFAULT 4,
    "semanasSemRepetir" INTEGER NOT NULL DEFAULT 1,
    "naoRepetirDiasSeguidos" BOOLEAN NOT NULL DEFAULT true,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cardapio" (
    "id" TEXT NOT NULL,
    "semanaInicio" DATE NOT NULL,
    "status" "StatusCardapio" NOT NULL DEFAULT 'RASCUNHO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "homologadoEm" TIMESTAMP(3),

    CONSTRAINT "Cardapio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCardapio" (
    "id" TEXT NOT NULL,
    "cardapioId" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "posicaoId" TEXT NOT NULL,
    "pratoId" TEXT,
    "travado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ItemCardapio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Prato_nomeNormalizado_key" ON "Prato"("nomeNormalizado");

-- CreateIndex
CREATE INDEX "Prato_categoria_ativo_idx" ON "Prato"("categoria", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "Posicao_area_ordem_key" ON "Posicao"("area", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "Cardapio_semanaInicio_key" ON "Cardapio"("semanaInicio");

-- CreateIndex
CREATE INDEX "ItemCardapio_pratoId_data_idx" ON "ItemCardapio"("pratoId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCardapio_cardapioId_data_posicaoId_key" ON "ItemCardapio"("cardapioId", "data", "posicaoId");

-- AddForeignKey
ALTER TABLE "PosicaoOpcao" ADD CONSTRAINT "PosicaoOpcao_posicaoId_fkey" FOREIGN KEY ("posicaoId") REFERENCES "Posicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosicaoOpcao" ADD CONSTRAINT "PosicaoOpcao_pratoId_fkey" FOREIGN KEY ("pratoId") REFERENCES "Prato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCardapio" ADD CONSTRAINT "ItemCardapio_cardapioId_fkey" FOREIGN KEY ("cardapioId") REFERENCES "Cardapio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCardapio" ADD CONSTRAINT "ItemCardapio_posicaoId_fkey" FOREIGN KEY ("posicaoId") REFERENCES "Posicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCardapio" ADD CONSTRAINT "ItemCardapio_pratoId_fkey" FOREIGN KEY ("pratoId") REFERENCES "Prato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
