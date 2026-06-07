import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PersonneService } from './personne.service';
import { PrismaService } from '../prisma/prisma.service';
import { TypeLogement } from './dto/create-personne.dto';

describe('PersonneService', () => {
  let service: PersonneService;

  const mockPrisma = {
    dossier: { findUnique: jest.fn() },
    statut: { findUnique: jest.fn() },
    personne: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonneService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PersonneService>(PersonneService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a personne', async () => {
      mockPrisma.statut.findUnique.mockResolvedValue({
        id: 'statut-id',
        nom: 'Salarié',
      });
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.personne.create.mockResolvedValue({
        id: 'personne-id',
        nom: 'Dupont',
        prenom: 'Jean',
        typeLogement: 'locataire',
        statutId: 'statut-id',
        dossierId: 'dossier-id',
      });

      const result = await service.create('account-id', {
        nom: 'Dupont',
        prenom: 'Jean',
        typeLogement: TypeLogement.locataire,
        statutId: 'statut-id',
      });

      expect(result.id).toBe('personne-id');
      expect(result.nom).toBe('Dupont');
      expect(mockPrisma.personne.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nom: 'Dupont',
            prenom: 'Jean',
            dossierId: 'dossier-id',
          }),
        }),
      );
    });

    it('should throw NotFoundException if statut does not exist', async () => {
      mockPrisma.statut.findUnique.mockResolvedValue(null);

      await expect(
        service.create('account-id', {
          nom: 'Dupont',
          prenom: 'Jean',
          typeLogement: TypeLogement.locataire,
          statutId: 'invalid-statut',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if dossier does not exist', async () => {
      mockPrisma.statut.findUnique.mockResolvedValue({ id: 'statut-id' });
      mockPrisma.dossier.findUnique.mockResolvedValue(null);

      await expect(
        service.create('account-id', {
          nom: 'Dupont',
          prenom: 'Jean',
          typeLogement: TypeLogement.locataire,
          statutId: 'statut-id',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all personnes for the dossier', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.personne.findMany.mockResolvedValue([
        { id: 'p1', nom: 'Dupont', statut: { nom: 'Salarié' } },
        { id: 'p2', nom: 'Martin', statut: { nom: 'Étudiant' } },
      ]);

      const result = await service.findAll('account-id');

      expect(result).toHaveLength(2);
      expect(mockPrisma.personne.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { dossierId: 'dossier-id' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a personne by id', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.personne.findFirst.mockResolvedValue({
        id: 'personne-id',
        nom: 'Dupont',
        statut: { nom: 'Salarié' },
      });

      const result = await service.findOne('personne-id', 'account-id');

      expect(result.id).toBe('personne-id');
    });

    it('should throw NotFoundException if personne not found', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.personne.findFirst.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'account-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a personne', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.personne.findFirst.mockResolvedValue({
        id: 'personne-id',
        dossierId: 'dossier-id',
      });
      mockPrisma.personne.update.mockResolvedValue({
        id: 'personne-id',
        nom: 'Updated',
        statut: { nom: 'Salarié' },
      });

      const result = await service.update('personne-id', 'account-id', {
        nom: 'Updated',
      });

      expect(result.nom).toBe('Updated');
      expect(mockPrisma.personne.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'personne-id' },
          data: { nom: 'Updated' },
        }),
      );
    });

    it('should throw NotFoundException if personne not found', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.personne.findFirst.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', 'account-id', { nom: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a personne', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.personne.findFirst.mockResolvedValue({
        id: 'personne-id',
        dossierId: 'dossier-id',
      });

      await service.remove('personne-id', 'account-id');

      expect(mockPrisma.personne.delete).toHaveBeenCalledWith({
        where: { id: 'personne-id' },
      });
    });

    it('should throw NotFoundException if personne not found', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.personne.findFirst.mockResolvedValue(null);

      await expect(service.remove('invalid-id', 'account-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
