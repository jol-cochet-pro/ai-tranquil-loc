import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { StorageService } from './storage.service';
import { DossierModule } from '../dossier/dossier.module';

@Module({
  imports: [DossierModule],
  controllers: [DocumentController],
  providers: [DocumentService, StorageService],
  exports: [DocumentService, StorageService],
})
export class DocumentModule {}
