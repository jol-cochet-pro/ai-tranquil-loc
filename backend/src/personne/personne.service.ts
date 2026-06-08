import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonneDto } from './dto/create-personne.dto';
import { UpdatePersonneDto } from './dto/update-personne.dto';

@Injectable()
export class PersonneService {
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

  async create(accountId: string, dto: CreatePersonneDto) {
    const statut = await this.prisma.statut.findUnique({
      where: { id: dto.statutId },
    });
    if (!statut) {
      throw new NotFoundException(`Statut with id ${dto.statutId} not found`);
    }

    const dossierId = await this.getDossierId(accountId);

    return this.prisma.personne.create({
      data: {
        nom: dto.nom,
        prenom: dto.prenom,
        email: dto.email,
        telephone: dto.telephone,
        revenus: dto.revenus,
        role: dto.role ?? 'candidat',
        typeLogement: dto.typeLogement,
        statutId: dto.statutId,
        dossierId,
      },
    });
  }

  async findAll(accountId: string) {
    const dossierId = await this.getDossierId(accountId);
    return this.prisma.personne.findMany({
      where: { dossierId },
      include: { statut: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, accountId: string) {
    const dossierId = await this.getDossierId(accountId);
    const personne = await this.prisma.personne.findFirst({
      where: { id, dossierId },
      include: { statut: true },
    });
    if (!personne) {
      throw new NotFoundException('Personne not found');
    }
    return personne;
  }

  async update(id: string, accountId: string, dto: UpdatePersonneDto) {
    const dossierId = await this.getDossierId(accountId);
    const personne = await this.prisma.personne.findFirst({
      where: { id, dossierId },
    });
    if (!personne) {
      throw new NotFoundException('Personne not found');
    }

    if (dto.statutId) {
      const statut = await this.prisma.statut.findUnique({
        where: { id: dto.statutId },
      });
      if (!statut) {
        throw new NotFoundException(`Statut with id ${dto.statutId} not found`);
      }
    }

    return this.prisma.personne.update({
      where: { id },
      data: dto,
      include: { statut: true },
    });
  }

  async remove(id: string, accountId: string) {
    const dossierId = await this.getDossierId(accountId);
    const personne = await this.prisma.personne.findFirst({
      where: { id, dossierId },
    });
    if (!personne) {
      throw new NotFoundException('Personne not found');
    }

    await this.prisma.personne.delete({ where: { id } });
  }

  async getCompletion(accountId: string) {
    const dossierId = await this.getDossierId(accountId);

    const personnes = await this.prisma.personne.findMany({
      where: { dossierId },
      include: { statut: true, invitations: true },
      orderBy: { createdAt: 'asc' },
    });

    const results = await Promise.all(
      personnes.map(async (p) => {
        const documentsCount = await this.prisma.document.count({
          where: { personneId: p.id },
        });

        const documentsRequired = await this.prisma.statutDocumentType.count({
          where: { statutId: p.statutId },
        });

        const invitationStatus =
          p.invitations.length > 0 ? p.invitations[0].statut : null;

        return {
          personneId: p.id,
          nom: p.nom,
          prenom: p.prenom,
          role: p.role,
          documentsCount,
          documentsRequired,
          invitationStatus,
        };
      }),
    );

    return results;
  }
}
