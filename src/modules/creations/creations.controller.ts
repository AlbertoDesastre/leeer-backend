import { ApiResponse, ApiTags } from '@nestjs/swagger';
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
import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';
import { Creation } from './entities/creation.entity';

@ApiTags('Creations')
@Controller('creations')
export class CreationsController {
  constructor(private readonly creationsService: CreationsService) {}

  @Post()
  @ApiResponse({ status: 201, type: Creation })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'El usuario no se encontró.' })
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

  @Get('author/:nickname')
  findAllByAuthorNickname(
    @Param('nickname') nickname: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.creationsService.findAllByAuthorNickname(nickname, paginationDto);
  }

  @Get('all-by/:term')
  findAllByTerm(@Param('term') term: string, @Query() paginationDto: PaginationDto) {
    return this.creationsService.findAllByTerm(term, paginationDto);
  }

  @Get(':term') // ¡Esta ruta debe ir al final siempre, porque hace mathing dinámico con cualquier cosa! Las rutas específicas, en Nest, van siempre lo más arriba posible.
  findOne(@Param('term') term: string) {
    return this.creationsService.findOne(term);
  }
}
