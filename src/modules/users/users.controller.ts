import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';

import { UsersService } from '@/modules/users/users.service';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';

import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';
import { GetUserResponseDto } from './dto/get-user-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, type: GetUserResponseDto, description: 'Usuario creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios (paginados)' })
  @ApiResponse({ status: 200, type: GetUserResponseDto, isArray: true })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':term')
  @ApiOperation({ summary: 'Obtener un usuario por ID, nickname o email' })
  @ApiParam({ name: 'term', type: String, description: 'UUID, nickname o email del usuario' })
  @ApiResponse({ status: 200, type: GetUserResponseDto })
  @ApiResponse({ status: 404, description: 'No hay ningún usuario que aplique a tu búsqueda.' })
  findOne(@Param('term') term: string) {
    return this.usersService.findOne(term);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del usuario' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, type: GetUserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
