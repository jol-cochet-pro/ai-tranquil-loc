import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransmissionService } from './transmission.service';
import { CreateTransmissionDto } from './dto/create-transmission.dto';

@Controller('dossier')
@UseGuards(JwtAuthGuard)
export class TransmissionController {
  constructor(private readonly transmissionService: TransmissionService) {}

  @Post('transmissions')
  create(
    @Req() req: { user: { sub: string } },
    @Body() dto: CreateTransmissionDto,
  ) {
    return this.transmissionService.create(req.user.sub, dto);
  }

  @Get('transmissions')
  findAll(@Req() req: { user: { sub: string } }) {
    return this.transmissionService.findAll(req.user.sub);
  }

  @Patch('transmissions/:id/revoke')
  revoke(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.transmissionService.revoke(id, req.user.sub);
  }
}
