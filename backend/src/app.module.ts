import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PersonneModule } from './personne/personne.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [AuthModule, PersonneModule, ConfigurationModule, DocumentModule],
})
export class AppModule {}
