import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DossierService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveDossierId(accountId: string): Promise<string> {
    const dossier = await this.prisma.dossier.findUnique({
      where: { accountId },
      select: { id: true },
    });
    if (!dossier) {
      throw new NotFoundException('Dossier not found');
    }
    return dossier.id;
  }
}
