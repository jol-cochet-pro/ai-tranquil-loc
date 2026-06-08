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
import { Response } from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Controller()
export class InvitationController {
  constructor(
    private readonly invitationService: InvitationService,
    private readonly documentService: DocumentService,
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

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, doc.chemin);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found on storage');
    }

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${doc.nomFichier}"`,
    );
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }
}
