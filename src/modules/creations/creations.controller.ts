import { ApiResponse, ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

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

import { CreationsService } from '@/modules/creations/creations.service';
import { CreateCreationDto } from '@/modules/creations/dto/create-creation.dto';
import { UpdateCreationDto } from '@/modules/creations/dto/update-creation.dto';
import { GetCreationResponseDto } from './dto/get-creation-response.dto';
import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';
import { CreationWithoutUserDto } from './dto/creation-without-user.dto';
import { GetPublicCreationResponseDto } from './dto/get-public-creation-response.dto';

@ApiTags('Creations')
@Controller('creations')
export class CreationsController {
  constructor(private readonly creationsService: CreationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva creación' })
  @ApiBody({ type: CreateCreationDto })
  @ApiResponse({
    status: 201,
    type: GetCreationResponseDto,
    description: 'Creación creada correctamente.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'El usuario no se encontró.' })
  create(@Body() createCreationDto: CreateCreationDto) {
    return this.creationsService.create(createCreationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las creaciones públicas (paginadas)' })
  @ApiResponse({ status: 200, type: GetCreationResponseDto, isArray: true })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.creationsService.findAll(paginationDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una creación por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCreationDto })
  @ApiResponse({ status: 200, type: CreationWithoutUserDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCreationDto: UpdateCreationDto) {
    return this.creationsService.update(id, updateCreationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una creación por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'La creación fue eliminada.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.creationsService.remove(id);
  }

  @Get('author/:nickname')
  @ApiOperation({ summary: 'Obtener todas las creaciones públicas de un autor por su nickname' })
  @ApiParam({ name: 'nickname', type: String })
  @ApiResponse({ status: 200, type: GetPublicCreationResponseDto, isArray: true })
  findAllByAuthorNickname(
    @Param('nickname') nickname: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.creationsService.findAllByAuthorNickname(nickname, paginationDto);
  }

  @Get('all-by/:term')
  @ApiOperation({ summary: 'Buscar todas las creaciones públicas cuyo título contenga el término' })
  @ApiParam({ name: 'term', type: String })
  @ApiResponse({ status: 200, type: GetPublicCreationResponseDto, isArray: true })
  findAllByTerm(@Param('term') term: string, @Query() paginationDto: PaginationDto) {
    return this.creationsService.findAllByTerm(term, paginationDto);
  }

  @Get(':term')
  @ApiOperation({ summary: 'Buscar una creación por ID o por título (exacto)' })
  @ApiParam({ name: 'term', type: String })
  @ApiResponse({ status: 200, type: GetPublicCreationResponseDto })
  @ApiResponse({ status: 404, description: 'No hay ninguna creación que aplique a tu búsqueda.' })
  findOne(@Param('term') term: string) {
    return this.creationsService.findOne(term);
  }
}
