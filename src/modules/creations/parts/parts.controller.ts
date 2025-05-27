import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';

import { AuthenticateByAuthorOwnership } from '@/modules/auth/decorators/authenticate-by-author-ownership.decorator';
import { VALID_ROLES } from '@/modules/auth/interfaces/valid-roles';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';
import { User } from '@/modules/users/entities/user.entity';

import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';
import { PartAndCreationPaginationDto } from './dto/part-and-creation-pagination-dto';

@Controller('/creations/:creation_id/parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  // por supuesto que el creador de la obra puede añadir partes, pero también los colaboradores aprobados por él/ella
  @AuthenticateByAuthorOwnership(VALID_ROLES.ORIGINAL_AUTHOR, VALID_ROLES.COLLABORATOR)
  create(@GetUser() user: User, @Body() createPartDto: CreatePartDto) {
    return this.partsService.create(user, createPartDto);
  }

  // este método es público a propósito, para que todos los lectores puedan leer las partes publicadas.
  @Get()
  findAll(@Param('creation_id') creation_id, @Query() paginationDto: PaginationDto) {
    return this.partsService.findAll(creation_id, paginationDto);
  }
}
