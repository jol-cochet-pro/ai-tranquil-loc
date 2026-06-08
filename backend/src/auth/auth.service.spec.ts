import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  jest,
  expect,
  describe,
  beforeEach,
  afterEach,
  it,
} from '@jest/globals';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    account: {
      findUnique: jest.fn<any>(),
      create: jest.fn<any>(),
      update: jest.fn<any>(),
    },
    statut: {
      findFirst: jest.fn<any>(),
    },
  };

  const mockJwtService = {
    sign: jest.fn<any>().mockReturnValue('test-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create account and dossier with personne, return token', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);
      mockPrisma.statut.findFirst.mockResolvedValue({
        id: 'statut-salarie',
        nom: 'Salarié',
      });
      mockPrisma.account.create.mockResolvedValue({
        id: 'account-id',
        email: 'test@test.com',
        passwordHash: 'hashed',
        dossier: { id: 'dossier-id' },
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'Password1',
      });

      expect(result.accessToken).toBe('test-token');
      expect(result.account.email).toBe('test@test.com');
      expect(mockPrisma.account.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@test.com',
            dossier: {
              create: expect.objectContaining({
                personnes: {
                  create: expect.objectContaining({
                    nom: 'test',
                    prenom: '',
                    role: 'candidat',
                    statutId: 'statut-salarie',
                    typeLogement: 'locataire',
                  }),
                },
              }),
            },
          }),
        }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.statut.findFirst.mockResolvedValue({
        id: 'statut-salarie',
        nom: 'Salarié',
      });
      mockPrisma.account.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.register({ email: 'existing@test.com', password: 'Password1' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const hash = await bcrypt.hash('Password1', 10);

      mockPrisma.account.findUnique.mockResolvedValue({
        id: 'account-id',
        email: 'test@test.com',
        passwordHash: hash,
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'Password1',
      });

      expect(result.accessToken).toBe('test-token');
      expect(result.account.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('Password1', 10);

      mockPrisma.account.findUnique.mockResolvedValue({
        id: 'account-id',
        email: 'test@test.com',
        passwordHash: hash,
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'WrongPassword1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent email', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@test.com', password: 'Password1' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('should return account info without password', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({
        id: 'account-id',
        email: 'test@test.com',
      });

      const result = await service.me('account-id');

      expect(result).toEqual({
        id: 'account-id',
        email: 'test@test.com',
      });
    });
  });

  describe('changeEmail', () => {
    const hash = bcrypt.hashSync('Password1', 10);

    beforeEach(() => {
      mockPrisma.account.findUnique.mockReset();
      mockPrisma.account.update = jest.fn<any>();
    });

    it('should update email when password is valid', async () => {
      mockPrisma.account.findUnique
        .mockResolvedValueOnce({
          id: 'account-id',
          passwordHash: hash,
        })
        .mockResolvedValueOnce(null);

      mockPrisma.account.update.mockResolvedValue({
        id: 'account-id',
        email: 'new@test.com',
      });

      const result = await service.changeEmail('account-id', {
        newEmail: 'new@test.com',
        password: 'Password1',
      });

      expect(result.email).toBe('new@test.com');
      expect(mockPrisma.account.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'account-id' },
          data: { email: 'new@test.com' },
        }),
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({
        id: 'account-id',
        passwordHash: hash,
      });

      await expect(
        service.changeEmail('account-id', {
          newEmail: 'new@test.com',
          password: 'WrongPassword1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ConflictException if email already in use', async () => {
      mockPrisma.account.findUnique
        .mockResolvedValueOnce({
          id: 'account-id',
          passwordHash: hash,
        })
        .mockResolvedValueOnce({ id: 'other-id', email: 'new@test.com' });

      await expect(
        service.changeEmail('account-id', {
          newEmail: 'new@test.com',
          password: 'Password1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('changePassword', () => {
    const hash = bcrypt.hashSync('Password1', 10);

    beforeEach(() => {
      mockPrisma.account.findUnique.mockReset();
      mockPrisma.account.update = jest.fn<any>();
    });

    it('should update password when current password is valid', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({
        id: 'account-id',
        passwordHash: hash,
      });
      mockPrisma.account.update.mockResolvedValue({ id: 'account-id' });

      const result = await service.changePassword('account-id', {
        currentPassword: 'Password1',
        newPassword: 'NewPassword1',
      });

      expect(result.message).toBe('Password updated');
      expect(mockPrisma.account.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'account-id' },
          data: { passwordHash: expect.any(String) as unknown },
        }),
      );
    });

    it('should throw UnauthorizedException for wrong current password', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({
        id: 'account-id',
        passwordHash: hash,
      });

      await expect(
        service.changePassword('account-id', {
          currentPassword: 'WrongPassword1',
          newPassword: 'NewPassword1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
