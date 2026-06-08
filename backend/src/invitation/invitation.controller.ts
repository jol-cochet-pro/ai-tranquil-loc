import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvitationService } from './invitation.service';
import { DocumentService } from '../document/document.service';
import { StorageService } from '../document/storage.service';
import { Response } from 'express';

@Controller()
export class InvitationController {
  constructor(
    private readonly invitationService: InvitationService,
    private readonly documentService: DocumentService,
    private readonly storage: StorageService,
  ) {}

  @Post('dossier/personnes/:id/invitations')
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: { user: { sub: string } },
    @Param('id') personneId: string,
  ) {
    return this.invitationService.create(req.user.sub, personneId);
  }

  @Get('dossier/invitations')
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: { user: { sub: string } }) {
    return this.invitationService.findAllForDossier(req.user.sub);
  }

  @Get('invitations/:token')
  async findByToken(@Param('token') token: string) {
    const invitation = await this.invitationService.findByToken(token);
    if (invitation.statut === 'pending') {
      await this.invitationService.markAsViewed(token);
    }
    return invitation;
  }

  @Put('invitations/:token')
  updateByToken(
    @Param('token') token: string,
    @Body()
    data: {
      nom?: string;
      prenom?: string;
      email?: string;
      telephone?: string;
    },
  ) {
    return this.invitationService.updateByToken(token, data);
  }

  @Get('invitations/:token/documents')
  async listDocuments(@Param('token') token: string) {
    const invitation = await this.invitationService.findByToken(token);
    return this.documentService.findAllForPersonneByPersonneId(
      invitation.personneId,
    );
  }

  @Post('invitations/:token/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('token') token: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const invitation = await this.invitationService.findByToken(token);
    const body = req.body as {
      typeDocumentId?: string;
      typeDocumentPersonnalise?: string;
    };
    const typeDocumentId = body?.typeDocumentId;
    const typeDocumentPersonnalise = body?.typeDocumentPersonnalise;

    if (!typeDocumentId) {
      throw new BadRequestException('typeDocumentId is required');
    }

    return this.documentService.uploadForPersonne(
      invitation.personneId,
      file,
      typeDocumentId,
      typeDocumentPersonnalise,
    );
  }

  @Get('invitations/:token/documents/:docId/download')
  async downloadDocument(
    @Param('token') token: string,
    @Param('docId') docId: string,
    @Res() res: Response,
  ) {
    const invitation = await this.invitationService.findByToken(token);
    const doc = await this.documentService.getDocumentByPersonne(
      docId,
      invitation.personneId,
    );

    const stream = await this.storage.readStream(doc.chemin);
    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${doc.nomFichier}"`,
    );
    stream.pipe(res);
  }
}
