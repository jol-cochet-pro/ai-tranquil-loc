import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TransmissionService } from './transmission.service';
import { PrismaService } from '../prisma/prisma.service';
import { jest, expect, describe, beforeEach, it } from '@jest/globals';

describe('TransmissionService', () => {
  let service: TransmissionService;

  const mockPrisma = {
    dossier: {
      findUnique: jest.fn<any>(),
    },
    transmission: {
      create: jest.fn<any>(),
      findMany: jest.fn<any>(),
      findFirst: jest.fn<any>(),
      update: jest.fn<any>(),
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
    it('should create a transmission with document types', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.transmission.create.mockResolvedValue({
        id: 'tx-id',
        token: 'token-123',
        dossierId: 'dossier-id',
        revoked: false,
        expireAt: null,
        transmissionDocumentTypes: [{ documentTypeId: 'dt-1' }],
      });

      const result = await service.create('account-id', {
        documentTypeIds: ['dt-1'],
      });

      expect(result.id).toBe('tx-id');
      expect(result.token).toBe('token-123');
      expect(mockPrisma.transmission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dossierId: 'dossier-id',
            transmissionDocumentTypes: {
              create: [{ documentTypeId: 'dt-1' }],
            },
          }),
        }),
      );
    });

    it('should set expireAt when expireInDays is provided', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.transmission.create.mockResolvedValue({
        id: 'tx-id',
        token: 'token-123',
        expireAt: new Date(),
      });

      await service.create('account-id', {
        documentTypeIds: ['dt-1'],
        expireInDays: 7,
      });

      expect(mockPrisma.transmission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            expireAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should throw NotFoundException if dossier does not exist', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue(null);

      await expect(
        service.create('account-id', { documentTypeIds: ['dt-1'] }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all transmissions for the dossier', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.transmission.findMany.mockResolvedValue([
        {
          id: 'tx-1',
          token: 'token-1',
          revoked: false,
          expireAt: null,
          transmissionDocumentTypes: [
            { documentType: { id: 'dt-1', nom: 'Fiche de paie' } },
          ],
        },
      ]);

      const result = await service.findAll('account-id');

      expect(result).toHaveLength(1);
      expect(result[0].token).toBe('token-1');
      expect(mockPrisma.transmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { dossierId: 'dossier-id' },
        }),
      );
    });
  });

  describe('revoke', () => {
    it('should revoke a transmission', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.transmission.findFirst.mockResolvedValue({
        id: 'tx-id',
        dossierId: 'dossier-id',
      });
      mockPrisma.transmission.update.mockResolvedValue({
        id: 'tx-id',
        revoked: true,
      });

      await service.revoke('tx-id', 'account-id');

      expect(mockPrisma.transmission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tx-id' },
          data: { revoked: true },
        }),
      );
    });

    it('should throw NotFoundException if transmission not found', async () => {
      mockPrisma.dossier.findUnique.mockResolvedValue({ id: 'dossier-id' });
      mockPrisma.transmission.findFirst.mockResolvedValue(null);

      await expect(service.revoke('invalid-id', 'account-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
