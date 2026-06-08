import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentService } from './document.service';
import { StorageService } from './storage.service';

@Controller('dossier')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly storage: StorageService,
  ) {}

  @Post('personnes/:id/documents')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') personneId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const body = req.body as {
      typeDocumentId?: string;
      typeDocumentPersonnalise?: string;
    };
    const typeDocumentId = body?.typeDocumentId;
    const typeDocumentPersonnalise = body?.typeDocumentPersonnalise;

    if (!typeDocumentId) {
      throw new BadRequestException('typeDocumentId is required');
    }

    return this.documentService.upload(
      req.user.sub,
      personneId,
      file,
      typeDocumentId,
      typeDocumentPersonnalise,
    );
  }

  @Get('personnes/:id/documents')
  findAll(
    @Req() req: { user: { sub: string } },
    @Param('id') personneId: string,
  ) {
    return this.documentService.findAllForPersonne(personneId, req.user.sub);
  }

  @Delete('personnes/:personneId/documents/:docId')
  remove(@Req() req: { user: { sub: string } }, @Param('docId') docId: string) {
    return this.documentService.remove(docId, req.user.sub);
  }

  @Get('documents/:id/download-url')
  async getDownloadUrl(
    @Req() req: { user: { sub: string } },
    @Param('id') id: string,
  ) {
    const doc = await this.documentService.getDocument(id, req.user.sub);
    const url = await this.storage.getPresignedUrl(doc.chemin, doc.nomFichier);
    return { url };
  }
}
