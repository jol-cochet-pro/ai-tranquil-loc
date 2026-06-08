import { Module } from '@nestjs/common';
import { PersonneController } from './personne.controller';
import { PersonneService } from './personne.service';
import { DossierModule } from '../dossier/dossier.module';

@Module({
  imports: [DossierModule],
  controllers: [PersonneController],
  providers: [PersonneService],
  exports: [PersonneService],
})
export class PersonneModule {}
