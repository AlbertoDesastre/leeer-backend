import { Controller, Get, Post, Body, Patch, Query, ParseUUIDPipe, Param } from '@nestjs/common';
import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';
import { CreateCollaborationPetitionDto } from './dto/create-creation-collaboration-petition.dto';
import { CollaborationPaginationDto } from '@/modules/common/dto/collaborations-pagination-dto.dto';
import { UpdateCreationCollaborationDto } from './dto/update-creation-collaboration-petition.dto';

import { Authenticate } from '@/modules/auth/decorators/authenticate.decorator';
import { VALID_ROLES } from '@/modules/auth/interfaces/valid-roles';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';
import { User } from '@/modules/users/entities/user.entity';
import { AuthenticateByAuthorOwnership } from '@/modules/auth/decorators/authenticate-by-author-ownership.decorator';

import { CollaborationsService } from './collaborations.service';
import { GetCreation } from '../decorators/get-creation.decorator';
import { Creation } from '../entities/creation.entity';

@Controller('creations/:creation_id/collaborations')
export class CollaborationsController {
  constructor(private readonly creationsService: CollaborationsService) {}

  // Este método encuentra todas las peticiones que haya mandado o recibido el usuario.
  // Permito entrar a cualquier usuario que sea autor original o que por lo menos haya mandado petición. El servicio se encarga de darte solo las tuyas (o todas, en caso de ser el autor original)
  // Si no eres ni autor ni has mandado petición se entiende que no pintas nada en este método.
  @Get()
  @AuthenticateByAuthorOwnership(
    VALID_ROLES.ORIGINAL_AUTHOR,
    VALID_ROLES.COLLABORATOR,
    VALID_ROLES.PENDING_COLLABORATOR,
  )
  findAllMyCollaborations(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.creationsService.findAllMyCollaborations(user, paginationDto);
  }

  @Get('all')
  @AuthenticateByAuthorOwnership(
    VALID_ROLES.ORIGINAL_AUTHOR,
    VALID_ROLES.COLLABORATOR,
    VALID_ROLES.PENDING_COLLABORATOR,
  )
  findAllCollaborationPetitionsByCreation(
    @GetUser() user: User,
    @GetCreation() creat: Creation,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.creationsService.findAllCollaborationPetitionsByCreation(
      user,
      creat,
      paginationDto,
    );
  }

  @Post()
  @AuthenticateByAuthorOwnership()
  sendCollaborationPetition(
    @GetUser() user: User,
    @GetCreation() creat: Creation,
    @Body() createCollaborationPetitionDto: CreateCollaborationPetitionDto,
  ) {
    return this.creationsService.sendCollaborationPetition(
      user,
      creat,
      createCollaborationPetitionDto,
    );
  }

  @Patch(':id')
  @AuthenticateByAuthorOwnership(VALID_ROLES.ORIGINAL_AUTHOR)
  updateCollaborationPetition(
    @Param('id', ParseUUIDPipe) creation_collaboration_id: string,
    @Body() updateCreationCollaborationDto: UpdateCreationCollaborationDto,
  ) {
    return this.creationsService.updateCollaborationPetition(
      creation_collaboration_id,
      updateCreationCollaborationDto,
    );
  }

  // Este método obtiene todas las peticiones a una obra concreta
  @Get(':id') // Este método al final SIEMPRE porque es una ruta dinámica
  @AuthenticateByAuthorOwnership(
    VALID_ROLES.ORIGINAL_AUTHOR,
    VALID_ROLES.COLLABORATOR,
    VALID_ROLES.PENDING_COLLABORATOR,
  )
  getCollaborationPetition(
    // Solo necesitamos el collaboration_petition_id, el creation_id se obtiene internamente mediante el Guard
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) creation_collaboration_id: string,
  ) {
    return this.creationsService.getCollaborationPetition(user, creation_collaboration_id);
  }
}
