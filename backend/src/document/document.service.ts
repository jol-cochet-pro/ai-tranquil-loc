import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import { extname } from 'node:path';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  private async getDossierId(accountId: string) {
    const dossier = await this.prisma.dossier.findUnique({
      where: { accountId },
      select: { id: true },
    });
    if (!dossier) {
      throw new NotFoundException('Dossier not found');
    }
    return dossier.id;
  }

  private async assertPersonneOwnership(personneId: string, accountId: string) {
    const dossierId = await this.getDossierId(accountId);
    const personne = await this.prisma.personne.findFirst({
      where: { id: personneId, dossierId },
      include: { statut: true },
    });
    if (!personne) {
      throw new NotFoundException('Personne not found');
    }
    return personne;
  }

  private buildFilename(
    prenom: string,
    nom: string,
    typeDocumentNom: string,
    typeDocumentPersonnalise: string | undefined,
    ext: string,
  ): string {
    const typePart = typeDocumentPersonnalise
      ? slug(typeDocumentPersonnalise)
      : slug(typeDocumentNom);
    return `${slug(prenom)}_${slug(nom)}_${typePart}${ext}`;
  }

  async upload(
    accountId: string,
    personneId: string,
    file: Express.Multer.File,
    typeDocumentId: string,
    typeDocumentPersonnalise?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024} MB`,
      );
    }

    const personne = await this.assertPersonneOwnership(personneId, accountId);

    const typeDoc = await this.prisma.documentType.findUnique({
      where: { id: typeDocumentId },
    });
    if (!typeDoc) {
      throw new NotFoundException('Document type not found');
    }

    if (typeDoc.nom === 'Autre' && !typeDocumentPersonnalise) {
      throw new BadRequestException(
        'Custom document name required for type "Autre"',
      );
    }

    const ext = extname(file.originalname);
    const nomFichier = this.buildFilename(
      personne.prenom,
      personne.nom,
      typeDoc.nom,
      typeDocumentPersonnalise,
      ext,
    );

    const stored = await this.storage.store(file.buffer, nomFichier);

    return this.prisma.document.create({
      data: {
        nom: file.originalname,
        nomFichier,
        chemin: stored.chemin,
        mimeType: file.mimetype,
        taille: file.size,
        typeDocumentId,
        typeDocumentPersonnalise,
        personneId,
      },
      include: { typeDocument: true },
    });
  }

  async findAllForPersonne(personneId: string, accountId: string) {
    await this.assertPersonneOwnership(personneId, accountId);
    return this.prisma.document.findMany({
      where: { personneId },
      include: { typeDocument: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(documentId: string, accountId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { personne: { select: { dossierId: true } } },
    });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    const dossierId = await this.getDossierId(accountId);
    if (doc.personne.dossierId !== dossierId) {
      throw new NotFoundException('Document not found');
    }

    await this.storage.remove(doc.chemin);
    await this.prisma.document.delete({ where: { id: documentId } });
  }

  async getDocument(documentId: string, accountId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { personne: { select: { dossierId: true } } },
    });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    const dossierId = await this.getDossierId(accountId);
    if (doc.personne.dossierId !== dossierId) {
      throw new NotFoundException('Document not found');
    }

    return doc;
  }
}
