-- CreateTable
CREATE TABLE "Transmission" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expireAt" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dossierId" TEXT NOT NULL,

    CONSTRAINT "Transmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransmissionDocumentType" (
    "transmissionId" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,

    CONSTRAINT "TransmissionDocumentType_pkey" PRIMARY KEY ("transmissionId","documentTypeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transmission_token_key" ON "Transmission"("token");

-- AddForeignKey
ALTER TABLE "Transmission" ADD CONSTRAINT "Transmission_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransmissionDocumentType" ADD CONSTRAINT "TransmissionDocumentType_transmissionId_fkey" FOREIGN KEY ("transmissionId") REFERENCES "Transmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransmissionDocumentType" ADD CONSTRAINT "TransmissionDocumentType_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
