import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigurationService } from './configuration.service';

@Controller('configuration')
@UseGuards(JwtAuthGuard)
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get('statuts')
  findAllStatuts() {
    return this.configurationService.findAllStatuts();
  }

  @Get('statuts/:id/documents')
  findDocumentsForStatut(@Param('id') id: string) {
    return this.configurationService.findDocumentsForStatut(id);
  }

  @Get('document-types')
  findAllDocumentTypes() {
    return this.configurationService.findAllDocumentTypes();
  }
}
