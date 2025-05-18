import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { validate as isUuid } from 'uuid';

import { CreateCreationDto } from '@/modules/creations/dto/create-creation.dto';
import { UpdateCreationDto } from '@/modules/creations/dto/update-creation.dto';
import { Creation } from '@/modules/creations/entities/creation.entity';

import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';

@Injectable()
export class CreationsService {
  private paginationLimit: number;
  private logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Creation)
    private readonly creationsRepository: Repository<Creation>,
  ) {
    this.logger = new Logger();
    this.paginationLimit = this.configService.get<number>('paginationLimit');
  }

  async create(createCreationDto: CreateCreationDto) {
    const creation = this.creationsRepository.create(createCreationDto); // esta línea sólo crea la instancia de la creación, todavía no la grabó en base de datos

    try {
      await this.creationsRepository.save(creation);
      return creation;
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll(paginationDto: PaginationDto): Promise<Creation[]> {
    const { limit = this.paginationLimit, offset = 0 } = paginationDto;
    const creations = this.creationsRepository.find({ take: limit, skip: offset }); // take = toma el número de datos solicitado por paginationLimit | skip: se salta el número de resultados solicitados por offset

    if (!creations) throw new NotFoundException('No se han encontrado creaciones.');

    return creations;
  }

  async findOne(term: string): Promise<Creation> {
    let creation: Creation;

    if (isUuid(term)) {
      creation = await this.creationsRepository.findOneBy({ creation_id: term });
    } else {
      const query = this.creationsRepository.createQueryBuilder();
      /* Esto está super guay! Es un Where clásico de MySQL sin tener que escribir ninguna claúsula, y TypeORM lo hace super flexible! */
      // console.log(term);
      creation = await query.where('title LIKE :title ', { title: `%${term}%` }).getOne();
    }

    if (!creation)
      throw new NotFoundException('No hay ninguna creación que aplique a tu búsqueda.');

    return creation;
  }

  async update(id: string, updateCreationDto: UpdateCreationDto) {
    const creation = await this.creationsRepository.preload({
      creation_id: id,
      ...updateCreationDto,
    }); // Precarga una entidad de la base de datos en base a su llave primaria. Si no encontró nada entonces la instancia creada estará vacía.

    if (!creation)
      // BadRequestException me lo trae de serie Nest
      throw new BadRequestException(`La creación con id ${id} no existe y no se actualizó.`);

    try {
      await this.creationsRepository.save(creation);
      return creation;
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id); // si no encuentra a creación este método ya tira Exception

    try {
      await this.creationsRepository.delete({ creation_id: id }); // esta operación ni siquiera checkea si existe a creación en DB así que hay que hacer una comprobación manual
      return `La creación con id ${id} fue eliminado.`;
    } catch (error) {
      this.handleException(error);
    }
  }

  handleException(error) {
    this.logger.error(error); // en cualquier tipo de error me interesa el logeo.

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }

    throw new InternalServerErrorException('Algo terrible ocurrió en el servidor.');
  }
}
