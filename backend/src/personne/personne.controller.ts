import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PersonneService } from './personne.service';
import { CreatePersonneDto } from './dto/create-personne.dto';
import { UpdatePersonneDto } from './dto/update-personne.dto';

@Controller('dossier/personnes')
@UseGuards(JwtAuthGuard)
export class PersonneController {
  constructor(private readonly personneService: PersonneService) {}

  @Post()
  create(
    @Req() req: { user: { sub: string } },
    @Body() dto: CreatePersonneDto,
  ) {
    return this.personneService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Req() req: { user: { sub: string } }) {
    return this.personneService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.personneService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Req() req: { user: { sub: string } },
    @Param('id') id: string,
    @Body() dto: UpdatePersonneDto,
  ) {
    return this.personneService.update(id, req.user.sub, dto);
  }

  @Delete(':id')
  remove(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.personneService.remove(id, req.user.sub);
  }
}
