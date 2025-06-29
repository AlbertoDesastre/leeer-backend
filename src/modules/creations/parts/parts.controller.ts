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
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';

import { AuthenticateByAuthorOwnership } from '@/modules/auth/decorators/authenticate-by-author-ownership.decorator';
import { VALID_ROLES } from '@/modules/auth/interfaces/valid-roles';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';
import { User } from '@/modules/users/entities/user.entity';

import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';
import { GetCreation } from '../decorators/get-creation.decorator';
import { Creation } from '../entities/creation.entity';
import { UpdatePartDto } from './dto/update-part.dto';

@Controller('/creations/:creation_id/parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  // por supuesto que el creador de la obra puede añadir partes, pero también los colaboradores aprobados por él/ella
  @AuthenticateByAuthorOwnership(VALID_ROLES.ORIGINAL_AUTHOR, VALID_ROLES.COLLABORATOR)
  create(
    @GetUser() user: User,
    @GetCreation() creat: Creation,
    @Body() createPartDto: CreatePartDto,
  ) {
    return this.partsService.create(user, creat, createPartDto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCreationDto: UpdatePartDto) {
    return this.partsService.update(id, updateCreationDto);
  }

  // este método es público a propósito, para que todos los lectores puedan leer las partes publicadas.
  @Get()
  findAll(@Param('creation_id') creation_id: string, @Query() paginationDto: PaginationDto) {
    return this.partsService.findAll({ creation_id, paginationDto, showDrafts: false });
  }

  @Get('author')
  @AuthenticateByAuthorOwnership(VALID_ROLES.ORIGINAL_AUTHOR, VALID_ROLES.COLLABORATOR)
  findAllMyParts(@Param('creation_id') creation_id: string, @Query() paginationDto: PaginationDto) {
    return this.partsService.findAll({ creation_id, paginationDto, showDrafts: true });
  }

  @Get('get-only')
  findOne(@Param('creation_id') creation_id: string, @Query('id', ParseUUIDPipe) id: string) {
    return this.partsService.findOne({ creation_id, id, showDrafts: false });
  }

  @Get('author/get-only')
  @AuthenticateByAuthorOwnership(VALID_ROLES.ORIGINAL_AUTHOR, VALID_ROLES.COLLABORATOR)
  findMyPart(@Param('creation_id') creation_id: string, @Query('id', ParseUUIDPipe) id: string) {
    return this.partsService.findOne({ creation_id, id, showDrafts: true });
  }

  @Delete(':id')
  @AuthenticateByAuthorOwnership(VALID_ROLES.ORIGINAL_AUTHOR)
  remove(@GetCreation() creation: Creation, @Param('id', ParseUUIDPipe) id: string) {
    return this.partsService.remove(creation.creation_id, id);
  }

  @Get('collab-info')
  findAllWithCollabInfo(
    @Param('creation_id') creation_id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.partsService.findAllWithCollabInfo({
      creation_id,
      paginationDto,
      showDrafts: false,
    });
  }
}
