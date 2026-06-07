-- CreateEnum
CREATE TYPE "TypeLogement" AS ENUM ('locataire', 'proprietaire', 'heberge');

-- CreateEnum
CREATE TYPE "StatutInvitation" AS ENUM ('pending', 'viewed', 'completed');

-- CreateTable
CREATE TABLE "Personne" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "revenus" INTEGER,
    "typeLogement" "TypeLogement" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "statutId" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,

    CONSTRAINT "Personne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statut" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatutDocumentType" (
    "statutId" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,

    CONSTRAINT "StatutDocumentType_pkey" PRIMARY KEY ("statutId","documentTypeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Statut_nom_key" ON "Statut"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_nom_key" ON "DocumentType"("nom");

-- AddForeignKey
ALTER TABLE "Personne" ADD CONSTRAINT "Personne_statutId_fkey" FOREIGN KEY ("statutId") REFERENCES "Statut"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personne" ADD CONSTRAINT "Personne_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatutDocumentType" ADD CONSTRAINT "StatutDocumentType_statutId_fkey" FOREIGN KEY ("statutId") REFERENCES "Statut"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatutDocumentType" ADD CONSTRAINT "StatutDocumentType_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
