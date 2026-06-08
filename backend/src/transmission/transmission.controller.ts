import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransmissionService } from './transmission.service';
import { CreateTransmissionDto } from './dto/create-transmission.dto';
import { Response } from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Controller()
export class TransmissionController {
  constructor(private readonly transmissionService: TransmissionService) {}

  @Post('dossier/transmissions')
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: { user: { sub: string } },
    @Body() dto: CreateTransmissionDto,
  ) {
    return this.transmissionService.create(req.user.sub, {
      documentTypeIds: dto.documentTypeIds,
      expireAt: dto.expireAt ? new Date(dto.expireAt) : null,
    });
  }

  @Get('dossier/transmissions')
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: { user: { sub: string } }) {
    return this.transmissionService.findAllForDossier(req.user.sub);
  }

  @Patch('dossier/transmissions/:id/revoke')
  @UseGuards(JwtAuthGuard)
  revoke(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.transmissionService.revoke(req.user.sub, id);
  }

  @Get('transmissions/:token')
  async findByToken(@Param('token') token: string) {
    return this.transmissionService.findByToken(token);
  }

  @Get('transmissions/:token/documents/:docId/download')
  async downloadDocument(
    @Param('token') token: string,
    @Param('docId') docId: string,
    @Res() res: Response,
  ) {
    const transmission = await this.transmissionService.findByToken(token);
    const doc = transmission.documents.find((d) => d.id === docId);
    if (!doc) {
      throw new BadRequestException('Document not found in this transmission');
    }

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
