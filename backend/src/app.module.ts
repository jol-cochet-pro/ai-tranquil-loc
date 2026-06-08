import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PersonneModule } from './personne/personne.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { DocumentModule } from './document/document.module';
import { InvitationModule } from './invitation/invitation.module';
import { TransmissionModule } from './transmission/transmission.module';

@Module({
  imports: [
    AuthModule,
    PersonneModule,
    ConfigurationModule,
    DocumentModule,
    InvitationModule,
    TransmissionModule,
  ],
})
export class AppModule {}
