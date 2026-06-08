import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DossierService } from '../dossier/dossier.service';
import { randomUUID } from 'node:crypto';

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dossierService: DossierService,
  ) {}

  async create(accountId: string, personneId: string) {
    const dossierId = await this.dossierService.resolveDossierId(accountId);

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
      orderBy: { nom: 'asc' },
    });

    return {
      ...invitation,
      documentTypes,
    };
  }

  async updateByToken(
    token: string,
    data: { nom?: string; prenom?: string; email?: string; telephone?: string },
  ) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.prisma.personne.update({
      where: { id: invitation.personneId },
      data,
    });

    return this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { statut: 'completed' },
    });
  }

  async findAllForDossier(accountId: string) {
    const dossierId = await this.dossierService.resolveDossierId(accountId);

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
