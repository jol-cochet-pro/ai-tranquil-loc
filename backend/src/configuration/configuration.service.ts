import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigurationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllStatuts() {
    return this.prisma.statut.findMany({
      orderBy: { nom: 'asc' },
    });
  }

  async findDocumentsForStatut(statutId: string) {
    const statut = await this.prisma.statut.findUnique({
      where: { id: statutId },
    });
    if (!statut) {
      throw new NotFoundException('Statut not found');
    }

    return this.prisma.documentType.findMany({
      where: {
        statutDocumentTypes: {
          some: { statutId },
        },
      },
      orderBy: { nom: 'asc' },
    });
  }

  async findAllDocumentTypes() {
    return this.prisma.documentType.findMany({
      orderBy: { nom: 'asc' },
    });
  }
}
