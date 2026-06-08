/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */

import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { jest, expect, describe, beforeEach, it } from '@jest/globals';

const mockSend = jest.fn<any>();
let mockGetSignedUrlImpl: jest.Mock<any> = jest.fn<any>();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => ({
    send: mockSend,
  })),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn((input: any) => ({ input })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: (...args: any[]) => mockGetSignedUrlImpl(...args),
}));

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    process.env.S3_ENDPOINT = 'http://localhost:9000';
    process.env.S3_REGION = 'eu-west-1';
    process.env.S3_ACCESS_KEY = 'test-key';
    process.env.S3_SECRET_KEY = 'test-secret';
    process.env.S3_BUCKET = 'test-bucket';

    mockGetSignedUrlImpl = jest.fn<any>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile();

    service = module.get<StorageService>(StorageService);
    jest.clearAllMocks();
  });

  describe('getPresignedUrl', () => {
    it('should return a presigned URL for the given chemin and filename', async () => {
      mockGetSignedUrlImpl.mockResolvedValue(
        'https://test-bucket.s3.localhost/path/to/file.pdf?signature=abc',
      );

      const url = await service.getPresignedUrl(
        'a1b2c3d4/jean_dupont_cni.pdf',
        'jean_dupont_cni.pdf',
      );

      expect(url).toBe(
        'https://test-bucket.s3.localhost/path/to/file.pdf?signature=abc',
      );
      expect(mockGetSignedUrlImpl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            ResponseContentDisposition:
              'attachment; filename="jean_dupont_cni.pdf"',
          }),
        }),
        expect.objectContaining({
          expiresIn: 300,
        }),
      );
    });
  });

  describe('store', () => {
    it('should store a file in S3 and return chemin and nomFichier', async () => {
      mockSend.mockResolvedValue({});

      const result = await service.store(
        Buffer.from('file-content'),
        'jean_dupont_cni.pdf',
      );

      expect(result.chemin).toMatch(/^[a-f0-9]+\/jean_dupont_cni\.pdf$/);
      expect(result.nomFichier).toBe('jean_dupont_cni.pdf');
      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a file from S3 by chemin', async () => {
      mockSend.mockResolvedValue({});

      await service.remove('a1b2c3d4/jean_dupont_cni.pdf');

      expect(mockSend).toHaveBeenCalled();
    });
  });
});
