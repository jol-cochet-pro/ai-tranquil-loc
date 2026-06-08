import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { PrismaService } from '../prisma/prisma.service';
import { jest, expect, describe, beforeEach, it } from '@jest/globals';

describe('InvitationService', () => {
  let service: InvitationService;

  const mockPrisma = {
    dossier: { findUnique: jest.fn<any>() },
    personne: { findFirst: jest.fn<any>(), update: jest.fn<any>() },
    invitation: {
      create: jest.fn<any>(),
      findUnique: jest.fn<any>(),
      findMany: jest.fn<any>(),
      update: jest.fn<any>(),
    },
    documentType: {
      findMany: jest.fn<any>(),
    },
    statut: {
      findMany: jest.fn<any>(),
    },
    statutDocumentType: {
      findMany: jest.fn<any>(),
    },
    document: {
      findFirst: jest.fn<any>(),
      delete: jest.fn<any>(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InvitationService>(InvitationService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an invitation with a token for the personne', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.personne.findFirst.mockResolvedValue({
        id: 'personne-id',
        nom: 'Dupont',
        prenom: 'Jean',
        dossierId: 'dossier-id',
      });
      mockPrisma.invitation.create.mockResolvedValue({
        id: 'invitation-id',
        token: 'uuid-token',
        statut: 'pending',
        personneId: 'personne-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create('account-id', 'personne-id');

      expect(result.token).toBe('uuid-token');
      expect(result.statut).toBe('pending');
      expect(mockPrisma.invitation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            personneId: 'personne-id',
            token: expect.any(String),
          }),
        }),
      );
    });

    it('should throw NotFoundException if personne not found', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.personne.findFirst.mockResolvedValue(null);

      await expect(
        service.create('account-id', 'invalid-personne'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByToken', () => {
    it('should return invitation with personne info for a valid token', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        id: 'invitation-id',
        token: 'valid-token',
        statut: 'pending',
        personneId: 'personne-id',
        personne: {
          id: 'personne-id',
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean@test.com',
          telephone: '0102030405',
          revenus: 2500,
          statutId: 'statut-id',
          typeLogement: 'locataire',
          statut: { id: 'statut-id', nom: 'Salarié' },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.documentType.findMany.mockResolvedValue([
        { id: 'dt1', nom: "Pièce d'identité" },
      ]);
      mockPrisma.statut.findMany.mockResolvedValue([
        { id: 'statut-id', nom: 'Salarié' },
      ]);
      mockPrisma.statutDocumentType.findMany.mockResolvedValue([
        {
          statutId: 'statut-id',
          documentType: { id: 'dt1', nom: "Pièce d'identité" },
        },
      ]);

      const result = await service.findByToken('valid-token');

      expect(result.token).toBe('valid-token');
      expect(result.personne.nom).toBe('Dupont');
      expect(result.personne.statut.nom).toBe('Salarié');
      expect(result.documentTypes).toHaveLength(1);
      expect(result.statuts).toHaveLength(1);
      expect(result.documentsByStatut).toEqual({
        'statut-id': [{ id: 'dt1', nom: "Pièce d'identité" }],
      });
    });

    it('should throw NotFoundException for invalid token', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(null);

      await expect(service.findByToken('invalid-token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateByToken', () => {
    it('should update personne info and set statut to completed', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        id: 'invitation-id',
        token: 'valid-token',
        statut: 'pending',
        personneId: 'personne-id',
      });
      mockPrisma.personne.update.mockResolvedValue({
        id: 'personne-id',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean@test.com',
        telephone: '0102030405',
      });
      mockPrisma.invitation.update.mockResolvedValue({
        id: 'invitation-id',
        token: 'valid-token',
        statut: 'completed',
        personneId: 'personne-id',
      });

      const result = await service.updateByToken('valid-token', {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean@test.com',
      });

      expect(result.statut).toBe('completed');
      expect(mockPrisma.invitation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'invitation-id' },
          data: { statut: 'completed' },
        }),
      );
      expect(mockPrisma.personne.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'personne-id' },
          data: expect.objectContaining({ email: 'jean@test.com' }),
        }),
      );
    });

    it('should throw NotFoundException for invalid token', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(null);

      await expect(
        service.updateByToken('invalid-token', { nom: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllForDossier', () => {
    it('should return all invitations for the dossier', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.invitation.findMany.mockResolvedValue([
        {
          id: 'inv-1',
          token: 'token-1',
          statut: 'pending',
          personne: { id: 'p1', nom: 'Dupont', prenom: 'Jean' },
        },
        {
          id: 'inv-2',
          token: 'token-2',
          statut: 'completed',
          personne: { id: 'p2', nom: 'Martin', prenom: 'Alice' },
        },
      ]);

      const result = await service.findAllForDossier('account-id');

      expect(result).toHaveLength(2);
      expect(mockPrisma.invitation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            personne: { dossierId: 'dossier-id' },
          },
        }),
      );
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document associated with the invitation token', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        id: 'invitation-id',
        token: 'valid-token',
        statut: 'pending',
        personneId: 'personne-id',
      });
      mockPrisma.document.findFirst.mockResolvedValue({
        id: 'doc-1',
        chemin: 'some/path',
        personneId: 'personne-id',
      });
      mockPrisma.document.delete.mockResolvedValue({
        id: 'doc-1',
        chemin: 'some/path',
      });

      const result = await service.deleteDocument('valid-token', 'doc-1');

      expect(result.id).toBe('doc-1');
      expect(mockPrisma.document.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'doc-1' } }),
      );
    });

    it('should throw NotFoundException for invalid token', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteDocument('invalid-token', 'doc-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if document not found', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        id: 'invitation-id',
        token: 'valid-token',
        personneId: 'personne-id',
      });
      mockPrisma.document.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteDocument('valid-token', 'doc-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
