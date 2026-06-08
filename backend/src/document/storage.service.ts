import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

export interface StoredFile {
  chemin: string;
  nomFichier: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly s3Bucket: string;

  constructor() {
    this.s3Bucket = process.env.S3_BUCKET || 'ai-tranquil-loc';
    this.s3 = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'eu-west-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
      forcePathStyle: true,
    });
  }

  async store(buffer: Buffer, nomFichier: string): Promise<StoredFile> {
    const key = `${randomUUID().slice(0, 8)}/${nomFichier}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: buffer,
      }),
    );

    return { chemin: key, nomFichier };
  }

  async remove(chemin: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.s3Bucket, Key: chemin }),
      );
    } catch (err) {
      this.logger.warn(`Failed to remove S3 object at ${chemin}: ${err}`);
    }
  }

  async getPresignedUrl(chemin: string, nomFichier: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.s3Bucket,
      Key: chemin,
      ResponseContentDisposition: `attachment; filename="${nomFichier}"`,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 300 });
  }
}
