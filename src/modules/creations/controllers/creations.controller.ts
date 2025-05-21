import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CreationsService } from '@/modules/creations/services/creations.service';
import { CreateCreationDto } from '@/modules/creations/dto/create-creation.dto';
import { UpdateCreationDto } from '@/modules/creations/dto/update-creation.dto';

import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';
import { Authenticate } from '@/modules/auth/decorators/authenticate.decorator';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';
import { User } from '@/modules/users/entities/user.entity';
import { CreateCollaborationPetitionDto } from '../dto/create-creation-collaboration-petition.dto';

@Controller('creations')
export class CreationsController {
  constructor(private readonly creationsService: CreationsService) {}

  // CRUD básico para Creations
  @Post()
  create(@Body() createCreationDto: CreateCreationDto) {
    return this.creationsService.create(createCreationDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.creationsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.creationsService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCreationDto: UpdateCreationDto) {
    return this.creationsService.update(id, updateCreationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.creationsService.remove(id);
  }

  // Solicitudes de Colaboración
  @Post('collaborations')
  @Authenticate()
  sendCollaborationPetition(
    @GetUser() user: User,
    @Query('id', ParseUUIDPipe) creation_id: string,
    @Body() createCollaborationPetitionDto: CreateCollaborationPetitionDto,
  ) {
    return this.creationsService.sendCollaborationPetition(
      user,
      creation_id,
      createCollaborationPetitionDto,
    );
  }
  // TODO: Buscar creaciones por Tags. Se necesita haber creado el módulo de Tags previamente
}
