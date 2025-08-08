import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';

import { PartsService } from './parts.service';
import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { GetPartResponseDto } from './dto/get-part-response.dto';
import { GetPartWithFullDetailDto } from './dto/get-part-with-creation-and-user.dto';
import { GetParWithCollabInfoDto } from './dto/get-part-with-collab-info.dto';

import { User } from '@/modules/users/entities/user.entity';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';
import { VALID_ROLES } from '@/modules/auth/interfaces/valid-roles';
import { AuthenticateByAuthorOwnership } from '@/modules/auth/decorators/authenticate-by-author-ownership.decorator';

import { Creation } from '../entities/creation.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { GetCreation } from '../decorators/get-creation.decorator';

@ApiTags('Parts')
@Controller('/creations/:creation_id/parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  // TODO: Cambiar las llamadas GET-ONLY para que acepte un ID al final de la request. Ahora me parece una llamada fea, o tmb puedo cambiarle el nombre en vez de get-only ponerle otra cosa como "unique"

  @Post()
  @ApiOperation({ summary: 'Crear una nueva parte en una creación' })
  @ApiBody({ type: CreatePartDto })
  @ApiResponse({ status: 201, type: GetPartWithFullDetailDto, isArray: true })
  @ApiResponse({ status: 400, description: 'Bad request' })
  // por supuesto que el creador de la obra puede añadir partes, pero también los colaboradores aprobados por él/ella
  @AuthenticateByAuthorOwnership(VALID_ROLES.ORIGINAL_AUTHOR, VALID_ROLES.COLLABORATOR)
  create(@GetUser() user: User, @GetCreation() creat: Creation, @Body() createPartDto: CreatePartDto) {
    return this.partsService.create(user, creat, createPartDto);
  }

  // TODO: Revisar si este patch no necesita el RolGuard
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una parte por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePartDto })
  @ApiResponse({ status: 200, type: GetPartResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCreationDto: UpdatePartDto) {
    return this.partsService.update(id, updateCreationDto);
  }

  // este método es público a propósito, para que todos los lectores puedan leer las partes publicadas.
  @Get()
  @ApiOperation({ summary: 'Obtener todas las partes públicas de una creación (paginadas)' })
  @ApiParam({ name: 'creation_id', type: String })
  @ApiResponse({ status: 200, type: GetPartResponseDto, isArray: true })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findAll(@Param('creation_id') creation_id: string, @Query() paginationDto: PaginationDto) {
    return this.partsService.findAll({ creation_id, paginationDto, showDrafts: false });
  }

  @Get('author')
  @ApiOperation({
    summary: 'Obtener todas las partes (incluyendo borradores) del autor o colaborador',
  })
  @ApiParam({ name: 'creation_id', type: String })
  @ApiResponse({ status: 200, type: GetPartResponseDto, isArray: true })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @AuthenticateByAuthorOwnership(VALID_ROLES.ORIGINAL_AUTHOR, VALID_ROLES.COLLABORATOR)
  findAllMyParts(@Param('creation_id') creation_id: string, @Query() paginationDto: PaginationDto) {
    return this.partsService.findAll({ creation_id, paginationDto, showDrafts: true });
  }

  @Get('get-only')
  @ApiOperation({ summary: 'Obtener una parte pública por ID' })
  @ApiParam({ name: 'creation_id', type: String })
  @ApiQuery({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: GetPartResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('creation_id') creation_id: string, @Query('id', ParseUUIDPipe) id: string) {
    return this.partsService.findOne({ creation_id, id, showDrafts: false });
  }

  @Get('author/get-only')
  @ApiOperation({
    summary: 'Obtener una parte (incluyendo borradores) del autor o colaborador por ID',
  })
  @ApiParam({ name: 'creation_id', type: String })
  @ApiQuery({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: GetPartResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @AuthenticateByAuthorOwnership(VALID_ROLES.ORIGINAL_AUTHOR, VALID_ROLES.COLLABORATOR)
  findMyPart(@Param('creation_id') creation_id: string, @Query('id', ParseUUIDPipe) id: string) {
    return this.partsService.findOne({ creation_id, id, showDrafts: true });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una parte por ID' })
  @ApiParam({ name: 'creation_id', type: String })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Parte eliminada correctamente.' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @AuthenticateByAuthorOwnership(VALID_ROLES.ORIGINAL_AUTHOR)
  remove(@GetCreation() creation: Creation, @Param('id', ParseUUIDPipe) id: string) {
    return this.partsService.remove(creation.creation_id, id);
  }

  @Get('collab-info')
  @ApiOperation({
    summary:
      'Obtener todas las partes de una creación e información extra sobre si se trata de una colaboración o no y quién es el autor original de esa parte.',
  })
  @ApiParam({ name: 'creation_id', type: String })
  @ApiResponse({ status: 200, type: GetParWithCollabInfoDto, isArray: true })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findAllWithCollabInfo(@Param('creation_id') creation_id: string, @Query() paginationDto: PaginationDto) {
    return this.partsService.findAllWithCollabInfo({
      creation_id,
      paginationDto,
      showDrafts: false,
    });
  }
}
