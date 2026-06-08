import {
  Injectable,
  NotFoundException,
  GoneException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'node:crypto';

@Injectable()
export class TransmissionService {
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

  async create(
    accountId: string,
    data: { documentTypeIds: string[]; expireAt: Date | null },
  ) {
    const dossierId = await this.getDossierId(accountId);

    const foundTypes = await this.prisma.documentType.findMany({
      where: { id: { in: data.documentTypeIds } },
    });

    if (foundTypes.length !== data.documentTypeIds.length) {
      throw new NotFoundException('One or more document types not found');
    }

    return this.prisma.transmission.create({
      data: {
        token: randomUUID(),
        dossierId,
        expireAt: data.expireAt,
        transmissionDocumentTypes: {
          create: data.documentTypeIds.map((dtId) => ({
            documentTypeId: dtId,
          })),
        },
      },
      include: {
        transmissionDocumentTypes: {
          include: { documentType: true },
        },
      },
    });
  }

  async findByToken(token: string) {
    const transmission = await this.prisma.transmission.findUnique({
      where: { token },
      include: {
        transmissionDocumentTypes: {
          include: { documentType: true },
        },
      },
    });

    if (!transmission) {
      throw new NotFoundException('Transmission not found');
    }

    if (transmission.revoked) {
      throw new ForbiddenException('Ce lien a été révoqué');
    }

    if (transmission.expireAt && transmission.expireAt < new Date()) {
      throw new GoneException('Ce lien a expiré');
    }

    const documentTypeIds = transmission.transmissionDocumentTypes.map(
      (tdt) => tdt.documentTypeId,
    );

    const personnes = await this.prisma.personne.findMany({
      where: { dossierId: transmission.dossierId },
      include: { statut: true },
    });

    const documents = await this.prisma.document.findMany({
      where: {
        typeDocumentId: { in: documentTypeIds },
        personne: { dossierId: transmission.dossierId },
      },
      include: {
        personne: true,
        typeDocument: true,
      },
    });

    return {
      ...transmission,
      personnes,
      documents,
    };
  }

  async revoke(accountId: string, transmissionId: string) {
    const dossierId = await this.getDossierId(accountId);

    const transmission = await this.prisma.transmission.findUnique({
      where: { id: transmissionId },
    });

    if (!transmission || transmission.dossierId !== dossierId) {
      throw new NotFoundException('Transmission not found');
    }

    return this.prisma.transmission.update({
      where: { id: transmissionId },
      data: { revoked: true },
    });
  }

  async findAllForDossier(accountId: string) {
    const dossierId = await this.getDossierId(accountId);

    return this.prisma.transmission.findMany({
      where: { dossierId },
      include: {
        transmissionDocumentTypes: {
          include: { documentType: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
