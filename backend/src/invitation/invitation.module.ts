import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { DocumentModule } from '../document/document.module';
import { DossierModule } from '../dossier/dossier.module';

@Module({
  imports: [DocumentModule, DossierModule],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
