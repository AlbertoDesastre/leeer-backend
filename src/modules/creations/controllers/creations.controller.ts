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
import { VALID_ROLES } from '@/modules/auth/interfaces/valid-roles';
import { UpdateCreationCollaborationDto } from '../dto/update-creation-collaboration-petition.dto';

@Controller('creations')
export class CreationsController {
  constructor(private readonly creationsService: CreationsService) {}

  // Solicitudes de Colaboración
  // Este método obtiene todas las peticiones a una obra concreta
  @Get('collaborations')
  @AuthenticateByAuthorOwnership(
    VALID_ROLES.ORIGINAL_AUTHOR,
    VALID_ROLES.COLLABORATOR,
    VALID_ROLES.PENDING_COLLABORATOR,
  )
  getCollaborationPetition(
    // Solo necesitamos el collaboration_petition_id, el creation_id se obtiene internamente mediante el Guard
    @GetUser() user: User,
    @Query('collaboration_petition_id', ParseUUIDPipe) creation_collaboration_id: string,
  ) {
    return this.creationsService.getCollaborationPetition(user, creation_collaboration_id);
  }

  // Este método encuentra todas las peticiones que haya mandado o recibido el usuario.
  // Permito entrar a cualquier usuario que sea autor original o que por lo menos haya mandado petición. El servicio se encarga de darte solo las tuyas (o todas, en caso de ser el autor original)
  // Si no eres ni autor ni has mandado petición se entiende que no pintas nada en este método.
  @Get('collaborations/all')
  @AuthenticateByAuthorOwnership(
    VALID_ROLES.ORIGINAL_AUTHOR,
    VALID_ROLES.COLLABORATOR,
    VALID_ROLES.PENDING_COLLABORATOR,
  )
  findAllCollaborationPetitions(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.creationsService.findAllCollaborationPetitions(user, paginationDto);
  }

  @Get('collaborations/all/for')
  @Authenticate()
  findAllCollaborationPetitionsByCreation(
    @GetUser() user: User,
    @Query() collaborationPetitionPaginationDto: CollaborationPaginationDto,
  ) {
    return this.creationsService.findAllCollaborationPetitionsByCreation(
      user,
      collaborationPetitionPaginationDto,
    );
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

  @Patch('collaborations')
  @AuthenticateByAuthorOwnership(VALID_ROLES.ORIGINAL_AUTHOR)
  updateCollaborationPetition(
    @Query('collaboration_id', ParseUUIDPipe) creation_collaboration_id: string,
    @Body() updateCreationCollaborationDto: UpdateCreationCollaborationDto,
  ) {
    return this.creationsService.updateCollaborationPetition(
      creation_collaboration_id,
      updateCreationCollaborationDto,
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
