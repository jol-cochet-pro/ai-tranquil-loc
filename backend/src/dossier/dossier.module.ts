import { Module } from '@nestjs/common';
import { DossierService } from './dossier.service';

@Module({
  providers: [DossierService],
  exports: [DossierService],
})
export class DossierModule {}
