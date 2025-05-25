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
import { AuthenticateByAuthorOwnership } from '@/modules/auth/decorators/authenticate-by-author-ownership.decorator';
import { CollaborationPaginationDto } from '@/modules/common/dto/collaborations-pagination-dto.dto';

@Controller('creations')
export class CreationsController {
  constructor(private readonly creationsService: CreationsService) {}

  // Solicitudes de Colaboración
  @Get('collaborations')
  @AuthenticateByAuthorOwnership()
  getCollaborationPetition(
    // Solo necesitamos el collaboration_petition_id, el creation_id se obtiene internamente mediante el Guard
    @Query('collaboration_petition_id', ParseUUIDPipe) creation_collaboration_id: string,
  ) {
    return this.creationsService.getCollaborationPetition(creation_collaboration_id);
  }

  @Get('collaborations/all')
  @AuthenticateByAuthorOwnership()
  findAllCollaborationPetitions(@Query() collaborationPaginationDto: CollaborationPaginationDto) {
    return this.creationsService.findAllCollaborationPetitions(collaborationPaginationDto);
  }

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

  // Creations
  @Post()
  create(@Body() createCreationDto: CreateCreationDto) {
    return this.creationsService.create(createCreationDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.creationsService.findAll(paginationDto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCreationDto: UpdateCreationDto) {
    return this.creationsService.update(id, updateCreationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.creationsService.remove(id);
  }

  @Get(':term') // ¡Esta ruta debe ir al final siempre, porque hace mathing dinámico con cualquier cosa! Las rutas específicas, en Nest, van siempre lo más arriba posible.
  findOne(@Param('term') term: string) {
    return this.creationsService.findOne(term);
  }
}
