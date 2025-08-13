import { Controller, Get, Post, Body, Patch, Query, ParseUUIDPipe, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';
import { CreateCollaborationPetitionDto } from './dto/create-creation-collaboration-petition.dto';
import { UpdateCreationCollaborationDto } from './dto/update-creation-collaboration-petition.dto';

import { VALID_ROLES } from '@/modules/auth/interfaces/valid-roles';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';
import { User } from '@/modules/users/entities/user.entity';
import { AuthenticateByAuthorOwnership } from '@/modules/auth/decorators/authenticate-by-author-ownership.decorator';

import { CollaborationsService } from './collaborations.service';
import { GetCreation } from '../decorators/get-creation.decorator';
import { Creation } from '../entities/creation.entity';
import { GetCreationCollaborationResponseDto } from './dto/get-creation-collaboration-response.dto';
import { GetBasicCollaborationDto } from './dto/get-basic-collaboration-response.dto';

@ApiTags('Collaborations')
@Controller('creations/:creation_id/collaborations')
export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  // Este método encuentra todas las peticiones que haya mandado o recibido el usuario.
  // Permito entrar a cualquier usuario que sea autor original o que por lo menos haya mandado petición. El servicio se encarga de darte solo las tuyas (o todas, en caso de ser el autor original)
  // Si no eres ni autor ni has mandado petición se entiende que no pintas nada en este método.
  @Get()
  @AuthenticateByAuthorOwnership(
    VALID_ROLES.ORIGINAL_AUTHOR,
    VALID_ROLES.COLLABORATOR,
    VALID_ROLES.PENDING_COLLABORATOR,
  )
  @ApiOperation({ summary: 'Obtener todas las colaboraciones del usuario' })
  @ApiResponse({ status: 200, type: GetCreationCollaborationResponseDto, isArray: true })
  @ApiResponse({ status: 404, description: 'No se encontraron colaboraciones' })
  findAllMyCollaborations(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.collaborationsService.findAllMyCollaborations(user, paginationDto);
  }

  @Get('all')
  @AuthenticateByAuthorOwnership(
    VALID_ROLES.ORIGINAL_AUTHOR,
    VALID_ROLES.COLLABORATOR,
    VALID_ROLES.PENDING_COLLABORATOR,
  )
  @ApiOperation({ summary: 'Obtener todas las peticiones de colaboración para una creación' })
  @ApiParam({ name: 'creation_id', type: String, description: 'ID de la creación' })
  @ApiResponse({ status: 200, type: GetCreationCollaborationResponseDto, isArray: true })
  @ApiResponse({ status: 404, description: 'No se encontraron peticiones de colaboración' })
  findAllCollaborationPetitionsByCreation(
    @GetUser() user: User,
    @GetCreation() creat: Creation,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.collaborationsService.findAllCollaborationPetitionsByCreation(user, creat, paginationDto);
  }

  @Post()
  @AuthenticateByAuthorOwnership()
  @ApiOperation({ summary: 'Enviar una petición de colaboración' })
  @ApiBody({ type: CreateCollaborationPetitionDto })
  @ApiResponse({ status: 201, type: GetCreationCollaborationResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  sendCollaborationPetition(
    @GetUser() user: User,
    @GetCreation() creat: Creation,
    @Body() createCollaborationPetitionDto: CreateCollaborationPetitionDto,
  ) {
    return this.collaborationsService.sendCollaborationPetition(user, creat, createCollaborationPetitionDto);
  }

  @Patch(':id')
  @AuthenticateByAuthorOwnership(VALID_ROLES.ORIGINAL_AUTHOR)
  @ApiOperation({ summary: 'Actualizar una petición de colaboración' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la petición de colaboración' })
  @ApiBody({ type: UpdateCreationCollaborationDto })
  @ApiResponse({ status: 200, type: GetBasicCollaborationDto })
  @ApiResponse({ status: 404, description: 'Petición de colaboración no encontrada' })
  updateCollaborationPetition(
    @Param('id', ParseUUIDPipe) creation_collaboration_id: string,
    @Body() updateCreationCollaborationDto: UpdateCreationCollaborationDto,
  ) {
    return this.collaborationsService.updateCollaborationPetition(
      creation_collaboration_id,
      updateCreationCollaborationDto,
    );
  }

  // TODO: Revisar y formatear en el servicio el tipo que devuelve
  // Este método obtiene una colaboración específica por ID
  @Get(':id') // Este método al final SIEMPRE porque es una ruta dinámica
  @AuthenticateByAuthorOwnership(
    VALID_ROLES.ORIGINAL_AUTHOR,
    VALID_ROLES.COLLABORATOR,
    VALID_ROLES.PENDING_COLLABORATOR,
  )
  @ApiOperation({ summary: 'Obtener una petición de colaboración por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la petición de colaboración' })
  @ApiResponse({ status: 200, type: GetCreationCollaborationResponseDto })
  @ApiResponse({ status: 404, description: 'Petición de colaboración no encontrada' })
  getCollaborationPetition(
    // Solo necesitamos el collaboration_petition_id, el creation_id se obtiene internamente mediante el Guard
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) creation_collaboration_id: string,
  ) {
    return this.collaborationsService.getCollaborationPetition(user, creation_collaboration_id);
  }
}
