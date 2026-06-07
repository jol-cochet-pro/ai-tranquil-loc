import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const statuts = await Promise.all([
    prisma.statut.upsert({
      where: { nom: 'Salarié' },
      update: {},
      create: { id: 'statut-salarie', nom: 'Salarié' },
    }),
    prisma.statut.upsert({
      where: { nom: 'Fonctionnaire' },
      update: {},
      create: { id: 'statut-fonctionnaire', nom: 'Fonctionnaire' },
    }),
    prisma.statut.upsert({
      where: { nom: 'Étudiant' },
      update: {},
      create: { id: 'statut-etudiant', nom: 'Étudiant' },
    }),
    prisma.statut.upsert({
      where: { nom: 'Retraité' },
      update: {},
      create: { id: 'statut-retraite', nom: 'Retraité' },
    }),
    prisma.statut.upsert({
      where: { nom: 'Indépendant' },
      update: {},
      create: { id: 'statut-independant', nom: 'Indépendant' },
    }),
    prisma.statut.upsert({
      where: { nom: 'Sans emploi' },
      update: {},
      create: { id: 'statut-sans-emploi', nom: 'Sans emploi' },
    }),
  ]);

  const documentTypes = await Promise.all([
    prisma.documentType.upsert({
      where: { nom: "Pièce d'identité" },
      update: {},
      create: { id: 'doc-piece-identite', nom: "Pièce d'identité" },
    }),
    prisma.documentType.upsert({
      where: { nom: 'Justificatif de domicile' },
      update: {},
      create: { id: 'doc-justificatif-domicile', nom: 'Justificatif de domicile' },
    }),
    prisma.documentType.upsert({
      where: { nom: 'Fiche de paie' },
      update: {},
      create: { id: 'doc-fiche-paie', nom: 'Fiche de paie' },
    }),
    prisma.documentType.upsert({
      where: { nom: 'Contrat de travail' },
      update: {},
      create: { id: 'doc-contrat-travail', nom: 'Contrat de travail' },
    }),
    prisma.documentType.upsert({
      where: { nom: "Avis d'imposition" },
      update: {},
      create: { id: 'doc-avis-imposition', nom: "Avis d'imposition" },
    }),
    prisma.documentType.upsert({
      where: { nom: 'Relevé bancaire' },
      update: {},
      create: { id: 'doc-releve-bancaire', nom: 'Relevé bancaire' },
    }),
    prisma.documentType.upsert({
      where: { nom: 'Justificatif de caution' },
      update: {},
      create: { id: 'doc-justificatif-caution', nom: 'Justificatif de caution' },
    }),
    prisma.documentType.upsert({
      where: { nom: "Attestation d'hébergement" },
      update: {},
      create: { id: 'doc-attestation-hebergement', nom: "Attestation d'hébergement" },
    }),
  ]);

  const mapping: Record<string, string[]> = {
    'statut-salarie': [
      'doc-piece-identite',
      'doc-justificatif-domicile',
      'doc-fiche-paie',
      'doc-contrat-travail',
      'doc-avis-imposition',
    ],
    'statut-fonctionnaire': [
      'doc-piece-identite',
      'doc-justificatif-domicile',
      'doc-fiche-paie',
      'doc-contrat-travail',
      'doc-avis-imposition',
    ],
    'statut-etudiant': [
      'doc-piece-identite',
      'doc-justificatif-domicile',
      'doc-attestation-hebergement',
      'doc-releve-bancaire',
    ],
    'statut-retraite': [
      'doc-piece-identite',
      'doc-justificatif-domicile',
      'doc-avis-imposition',
      'doc-releve-bancaire',
    ],
    'statut-independant': [
      'doc-piece-identite',
      'doc-justificatif-domicile',
      'doc-avis-imposition',
      'doc-releve-bancaire',
      'doc-justificatif-caution',
    ],
    'statut-sans-emploi': [
      'doc-piece-identite',
      'doc-justificatif-domicile',
      'doc-releve-bancaire',
      'doc-justificatif-caution',
    ],
  };

  for (const [statutId, docTypeIds] of Object.entries(mapping)) {
    for (const documentTypeId of docTypeIds) {
      await prisma.statutDocumentType.upsert({
        where: { statutId_documentTypeId: { statutId, documentTypeId } },
        update: {},
        create: { statutId, documentTypeId },
      });
    }
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
