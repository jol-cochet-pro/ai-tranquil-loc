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
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentService } from './document.service';
import { StorageService } from './storage.service';
import { Response } from 'express';

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

  @Get('documents/:id/download')
  async download(
    @Req() req: { user: { sub: string } },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const doc = await this.documentService.getDocument(id, req.user.sub);
    const stream = await this.storage.readStream(doc.chemin);
    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${doc.nomFichier}"`,
    );
    stream.pipe(res);
  }
}
