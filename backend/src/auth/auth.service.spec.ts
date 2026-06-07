import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    account: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
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
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create account and dossier, return token', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(null);
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
            dossier: { create: {} },
          }),
        }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.account.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.register({ email: 'existing@test.com', password: 'Password1' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const bcrypt = require('bcrypt');
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
      const bcrypt = require('bcrypt');
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
});
