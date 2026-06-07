import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PersonneModule } from './personne/personne.module';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [AuthModule, PersonneModule, ConfigurationModule],
})
export class AppModule {}
