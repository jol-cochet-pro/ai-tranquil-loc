import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransmissionDto } from './dto/create-transmission.dto';
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

  async create(accountId: string, dto: CreateTransmissionDto) {
    const dossierId = await this.getDossierId(accountId);

    const data: {
      token: string;
      dossierId: string;
      expireAt?: Date;
      transmissionDocumentTypes: {
        create: { documentTypeId: string }[];
      };
    } = {
      token: randomUUID(),
      dossierId,
      transmissionDocumentTypes: {
        create: dto.documentTypeIds.map((id) => ({ documentTypeId: id })),
      },
    };

    if (dto.expireInDays) {
      data.expireAt = new Date(
        Date.now() + dto.expireInDays * 24 * 60 * 60 * 1000,
      );
    }

    return this.prisma.transmission.create({
      data,
      include: {
        transmissionDocumentTypes: {
          include: { documentType: true },
        },
      },
    });
  }

  async findAll(accountId: string) {
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

  async revoke(id: string, accountId: string) {
    const dossierId = await this.getDossierId(accountId);

    const transmission = await this.prisma.transmission.findFirst({
      where: { id, dossierId },
    });
    if (!transmission) {
      throw new NotFoundException('Transmission not found');
    }

    return this.prisma.transmission.update({
      where: { id },
      data: { revoked: true },
      include: {
        transmissionDocumentTypes: {
          include: { documentType: true },
        },
      },
    });
  }
}
