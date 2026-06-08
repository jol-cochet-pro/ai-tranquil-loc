import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'node:crypto';

@Injectable()
export class InvitationService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(accountId: string, personneId: string) {
    const dossierId = await this.getDossierId(accountId);

    const personne = await this.prisma.personne.findFirst({
      where: { id: personneId, dossierId },
    });
    if (!personne) {
      throw new NotFoundException('Personne not found');
    }

    return this.prisma.invitation.create({
      data: {
        token: randomUUID(),
        personneId,
      },
    });
  }

  async findByToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        personne: {
          include: { statut: true },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const documentTypes = await this.prisma.documentType.findMany({
      where: {
        statutDocumentTypes: {
          some: { statutId: invitation.personne.statutId },
        },
      },
      orderBy: { nom: 'asc' },
    });

    const statuts = await this.prisma.statut.findMany({
      orderBy: { nom: 'asc' },
    });

    const allStatutDocs = await this.prisma.statutDocumentType.findMany({
      include: {
        documentType: { select: { id: true, nom: true } },
      },
    });

    const documentsByStatut: Record<string, { id: string; nom: string }[]> = {};
    for (const row of allStatutDocs) {
      if (!documentsByStatut[row.statutId]) {
        documentsByStatut[row.statutId] = [];
      }
      documentsByStatut[row.statutId].push(row.documentType);
    }

    return {
      ...invitation,
      documentTypes,
      statuts,
      documentsByStatut,
    };
  }

  async updateByToken(
    token: string,
    data: {
      nom?: string;
      prenom?: string;
      email?: string;
      telephone?: string;
      statutId?: string;
      typeLogement?: string;
      revenus?: number;
    },
  ) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const updateData: Record<string, unknown> = {};
    if (data.nom !== undefined) updateData.nom = data.nom;
    if (data.prenom !== undefined) updateData.prenom = data.prenom;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.telephone !== undefined) updateData.telephone = data.telephone;
    if (data.statutId !== undefined) updateData.statutId = data.statutId;
    if (data.typeLogement !== undefined)
      updateData.typeLogement = data.typeLogement;
    if (data.revenus !== undefined) updateData.revenus = data.revenus;

    await this.prisma.personne.update({
      where: { id: invitation.personneId },
      data: updateData,
    });

    return this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { statut: 'completed' },
    });
  }

  async findAllForDossier(accountId: string) {
    const dossierId = await this.getDossierId(accountId);

    return this.prisma.invitation.findMany({
      where: {
        personne: { dossierId },
      },
      include: {
        personne: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteDocument(token: string, documentId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, personneId: invitation.personneId },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.delete({ where: { id: documentId } });
  }

  async markAsViewed(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.statut === 'pending') {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { statut: 'viewed' },
      });
    }
  }
}
