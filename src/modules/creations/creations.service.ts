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
import { User } from '@/modules/users/entities/user.entity';
import { CreationCollaboration } from './collaborations/entities/creation-collaboration.entity';

@Injectable()
export class CreationsService {
  private paginationLimit: number;
  private logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Creation)
    private readonly creationsRepository: Repository<Creation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CreationCollaboration)
    private readonly creationCollaborationRepository: Repository<CreationCollaboration>,
  ) {
    this.logger = new Logger();
    this.paginationLimit = this.configService.get<number>('paginationLimit');
  }

  async create(createCreationDto: CreateCreationDto) {
    const { user_id, ...creationDto } = createCreationDto;

    const user = await this.userRepository.findOneBy({ user_id });

    if (!user) throw new NotFoundException(`El usuario con id ${user_id} no se encontró`);

    const creation = this.creationsRepository.create({
      user,
      is_draft: creationDto.isDraft,
      ...creationDto,
    }); // esta línea sólo crea la instancia de la creación, todavía no la grabó en base de datos

    try {
      await this.creationsRepository.save(creation);
      return creation;
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll(paginationDto: PaginationDto): Promise<Creation[]> {
    const { limit = this.paginationLimit, offset = 0 } = paginationDto;
    const creations = this.creationsRepository.find({
      where: { is_draft: false }, // solo se mostrarán las creations públicas para los usuarios
      take: limit,
      skip: offset,
      relations: {
        // encontré el modo de regresar toda la data relacionada dios mío T.T
        user: true,
      },
    }); // take = toma el número de datos solicitado por paginationLimit | skip: se salta el número de resultados solicitados por offset

    if (!creations) throw new NotFoundException('No se han encontrado creaciones.');

    return creations;
  }

  async findOne(term: string): Promise<Creation> {
    let creation: Creation;

    if (isUuid(term)) {
      creation = await this.creationsRepository.findOneBy({ creation_id: term, is_draft: false });
      // console.log(creation);
    } else {
      const query = this.creationsRepository.createQueryBuilder('creac');
      /* Esto está super guay! Es un Where clásico de MySQL sin tener que escribir ninguna claúsula, y TypeORM lo hace super flexible! */
      // console.log(term);
      creation = await query
        .where('title LIKE :title AND is_draft = false', { title: `%${term}%` })
        .leftJoinAndSelect('creac.user', 'creacUsers') // en el primer parámetro hay que buscar por el nombre de la entidad "user" de mi entidad "Creation", no por el nombre de la tabla "users"
        .getOne();
    }

    if (!creation)
      throw new NotFoundException('No hay ninguna creación que aplique a tu búsqueda.');

    return creation;
  }

  async findAllByTerm(term: string, paginationDto: PaginationDto): Promise<Creation[]> {
    const { limit = this.paginationLimit, offset = 0 } = paginationDto;

    const query = this.creationsRepository
      .createQueryBuilder('creat')
      .where('LOWER(creat.title) LIKE :title AND creat.is_draft = false', {
        title: `%${term.toLowerCase()}%`,
      })
      .leftJoinAndSelect('creat.user', 'creatUsers')
      .take(limit)
      .skip(offset)
      .getMany();

    const creations = await query;

    if (creations.length === 0) {
      throw new NotFoundException('No hay ninguna creación que aplique a tu búsqueda.');
    }

    return creations;
  }

  async update(id: string, updateCreationDto: UpdateCreationDto) {
    const creation = await this.creationsRepository.preload({
      creation_id: id,
      is_draft: updateCreationDto.isDraft,
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
  /* Todas las creaciones públicas de un autor */
  async findAllByAuthorNickname(nickname: string, paginationDto: PaginationDto) {
    const { limit = this.paginationLimit, offset = 0 } = paginationDto;
    const user = await this.userRepository.findOneBy({ nickname }); // en base al nickname cojo el ID del usuario pa después buscar las creations

    if (!user) throw new NotFoundException(`No se encontró el autor con nickname: ${nickname}`);

    const creations = await this.creationsRepository.find({
      where: { user: { user_id: user.user_id }, is_draft: false },
      take: limit,
      skip: offset,
    });

    if (!creations || creations.length === 0)
      throw new NotFoundException('No se han encontrado creaciones para este autor.');

    return creations;
  }

  handleException(error) {
    this.logger.error(error); // en cualquier tipo de error me interesa el logeo.

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }

    throw new InternalServerErrorException('Algo terrible ocurrió en el servidor.');
  }
}
