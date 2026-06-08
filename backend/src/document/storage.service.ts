import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';

export interface StoredFile {
  chemin: string;
  nomFichier: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: 'local' | 's3';
  private readonly uploadDir: string;
  private s3: S3Client | null = null;
  private readonly s3Bucket: string;

  constructor() {
    this.driver = (process.env.STORAGE_DRIVER as 'local' | 's3') || 'local';
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.s3Bucket = process.env.S3_BUCKET || 'ai-tranquil-loc';

    if (this.driver === 'local') {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    } else {
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
  }

  async store(buffer: Buffer, nomFichier: string): Promise<StoredFile> {
    if (this.driver === 's3') {
      return this.storeS3(buffer, nomFichier);
    }
    return this.storeLocal(buffer, nomFichier);
  }

  async remove(chemin: string): Promise<void> {
    if (this.driver === 's3') {
      return this.removeS3(chemin);
    }
    return this.removeLocal(chemin);
  }

  async readStream(chemin: string): Promise<Readable> {
    if (this.driver === 's3') {
      return this.readStreamS3(chemin);
    }
    return this.readStreamLocal(chemin);
  }

  private storeLocal(buffer: Buffer, nomFichier: string): StoredFile {
    const subdir = randomUUID().slice(0, 8);
    const dir = path.join(this.uploadDir, subdir);
    fs.mkdirSync(dir, { recursive: true });

    const chemin = path.join(subdir, nomFichier);
    const fullPath = path.join(this.uploadDir, chemin);
    fs.writeFileSync(fullPath, buffer);
    return { chemin, nomFichier };
  }

  private removeLocal(chemin: string) {
    const fullPath = path.join(this.uploadDir, chemin);
    try {
      fs.unlinkSync(fullPath);
      const dir = path.dirname(fullPath);
      if (fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
      }
    } catch (err) {
      this.logger.warn(`Failed to remove file at ${fullPath}: ${err}`);
    }
  }

  private async storeS3(
    buffer: Buffer,
    nomFichier: string,
  ): Promise<StoredFile> {
    const key = `${randomUUID().slice(0, 8)}/${nomFichier}`;

    await this.s3!.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: buffer,
      }),
    );

    return { chemin: key, nomFichier };
  }

  private async removeS3(chemin: string): Promise<void> {
    try {
      await this.s3!.send(
        new DeleteObjectCommand({ Bucket: this.s3Bucket, Key: chemin }),
      );
    } catch (err) {
      this.logger.warn(`Failed to remove S3 object at ${chemin}: ${err}`);
    }
  }

  private readStreamLocal(chemin: string): Readable {
    const fullPath = path.join(this.uploadDir, chemin);
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('File not found on storage');
    }
    return fs.createReadStream(fullPath);
  }

  private async readStreamS3(chemin: string): Promise<Readable> {
    const response = await this.s3!.send(
      new GetObjectCommand({ Bucket: this.s3Bucket, Key: chemin }),
    );
    if (!response.Body) {
      throw new NotFoundException('File not found on storage');
    }
    return response.Body as Readable;
  }
}
