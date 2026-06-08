import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  GoneException,
  ForbiddenException,
} from '@nestjs/common';
import { TransmissionService } from './transmission.service';
import { PrismaService } from '../prisma/prisma.service';
import { jest, expect, describe, beforeEach, it } from '@jest/globals';

describe('TransmissionService', () => {
  let service: TransmissionService;

  const mockPrisma = {
    dossier: { findUnique: jest.fn<any>() },
    transmission: {
      create: jest.fn<any>(),
      findUnique: jest.fn<any>(),
      findMany: jest.fn<any>(),
      update: jest.fn<any>(),
    },
    documentType: {
      findMany: jest.fn<any>(),
    },
    document: {
      findMany: jest.fn<any>(),
    },
    personne: {
      findMany: jest.fn<any>(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransmissionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TransmissionService>(TransmissionService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a transmission with selected document types', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.documentType.findMany.mockResolvedValue([
        { id: 'dt1', nom: "Pièce d'identité" },
        { id: 'dt2', nom: 'Fiche de paie' },
      ]);
      mockPrisma.transmission.create.mockResolvedValue({
        id: 'tx-id',
        token: 'uuid-token',
        expireAt: null,
        revoked: false,
        dossierId: 'dossier-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        transmissionDocumentTypes: [
          { documentType: { id: 'dt1', nom: "Pièce d'identité" } },
          { documentType: { id: 'dt2', nom: 'Fiche de paie' } },
        ],
      });

      const result = await service.create('account-id', {
        documentTypeIds: ['dt1', 'dt2'],
        expireAt: null,
      });

      expect(result.token).toBe('uuid-token');
      expect(result.revoked).toBe(false);
      expect(mockPrisma.transmission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dossierId: 'dossier-id',
            token: expect.any(String),
          }),
        }),
      );
    });

    it('should throw NotFoundException if dossier not found', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue(null);

      await expect(
        service.create('account-id', {
          documentTypeIds: ['dt1'],
          expireAt: null,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if document type not found', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.documentType.findMany.mockResolvedValue([
        { id: 'dt1', nom: "Pièce d'identité" },
      ]);

      await expect(
        service.create('account-id', {
          documentTypeIds: ['dt1', 'unknown-dt'],
          expireAt: null,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a transmission with expiration date', async () => {
      const futureDate = new Date('2026-12-31');
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.documentType.findMany.mockResolvedValue([
        { id: 'dt1', nom: "Pièce d'identité" },
      ]);
      mockPrisma.transmission.create.mockResolvedValue({
        id: 'tx-id',
        token: 'uuid-token',
        expireAt: futureDate,
        revoked: false,
        dossierId: 'dossier-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        transmissionDocumentTypes: [
          { documentType: { id: 'dt1', nom: "Pièce d'identité" } },
        ],
      });

      const result = await service.create('account-id', {
        documentTypeIds: ['dt1'],
        expireAt: futureDate,
      });

      expect(result.expireAt).toEqual(futureDate);
    });
  });

  describe('findByToken', () => {
    it('should return transmission with documents for valid token', async () => {
      const now = new Date();
      mockPrisma.transmission.findUnique.mockResolvedValue({
        id: 'tx-id',
        token: 'valid-token',
        expireAt: null,
        revoked: false,
        dossierId: 'dossier-id',
        createdAt: now,
        updatedAt: now,
        transmissionDocumentTypes: [
          { documentType: { id: 'dt1', nom: "Pièce d'identité" } },
        ],
      });
      mockPrisma.personne.findMany.mockResolvedValue([
        { id: 'p1', nom: 'Dupont', prenom: 'Jean', statut: { nom: 'Salarié' } },
        {
          id: 'p2',
          nom: 'Martin',
          prenom: 'Alice',
          statut: { nom: 'Étudiant' },
        },
      ]);
      mockPrisma.document.findMany.mockResolvedValue([
        {
          id: 'doc1',
          nom: 'original.pdf',
          nomFichier: 'jean_dupont_piece_d_identite.pdf',
          mimeType: 'application/pdf',
          taille: 1000,
          typeDocumentId: 'dt1',
          personne: { id: 'p1', nom: 'Dupont', prenom: 'Jean' },
          typeDocument: { id: 'dt1', nom: "Pièce d'identité" },
        },
      ]);

      const result = await service.findByToken('valid-token');

      expect(result.token).toBe('valid-token');
      expect(result.personnes).toHaveLength(2);
      expect(result.documents).toHaveLength(1);
    });

    it('should throw NotFoundException for invalid token', async () => {
      mockPrisma.transmission.findUnique.mockResolvedValue(null);

      await expect(service.findByToken('invalid-token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if revoked', async () => {
      mockPrisma.transmission.findUnique.mockResolvedValue({
        id: 'tx-id',
        token: 'revoked-token',
        expireAt: null,
        revoked: true,
        dossierId: 'dossier-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.findByToken('revoked-token')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw GoneException if expired', async () => {
      const pastDate = new Date('2020-01-01');
      mockPrisma.transmission.findUnique.mockResolvedValue({
        id: 'tx-id',
        token: 'expired-token',
        expireAt: pastDate,
        revoked: false,
        dossierId: 'dossier-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.findByToken('expired-token')).rejects.toThrow(
        GoneException,
      );
    });
  });

  describe('revoke', () => {
    it('should set revoked to true', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.transmission.findUnique.mockResolvedValue({
        id: 'tx-id',
        dossierId: 'dossier-id',
      });
      mockPrisma.transmission.update.mockResolvedValue({
        id: 'tx-id',
        token: 'token',
        revoked: true,
      });

      const result = await service.revoke('account-id', 'tx-id');

      expect(result.revoked).toBe(true);
      expect(mockPrisma.transmission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tx-id' },
          data: { revoked: true },
        }),
      );
    });

    it('should throw NotFoundException if transmission not found', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.transmission.findUnique.mockResolvedValue(null);

      await expect(service.revoke('account-id', 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if transmission belongs to another dossier', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.transmission.findUnique.mockResolvedValue({
        id: 'tx-id',
        dossierId: 'other-dossier',
      });

      await expect(service.revoke('account-id', 'tx-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllForDossier', () => {
    it('should return all transmissions for the dossier', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.transmission.findMany.mockResolvedValue([
        {
          id: 'tx-1',
          token: 'token-1',
          revoked: false,
          expireAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          transmissionDocumentTypes: [
            { documentType: { id: 'dt1', nom: "Pièce d'identité" } },
          ],
        },
        {
          id: 'tx-2',
          token: 'token-2',
          revoked: true,
          expireAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          transmissionDocumentTypes: [],
        },
      ]);

      const result = await service.findAllForDossier('account-id');

      expect(result).toHaveLength(2);
      expect(mockPrisma.transmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { dossierId: 'dossier-id' },
        }),
      );
    });
  });
});
