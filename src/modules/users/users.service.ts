import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';

import { validate as isUuid } from 'uuid';
import { Creation } from '@/modules/creations/entities/creation.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private paginationLimit: number;
  private logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Creation)
    private readonly creationsRepository: Repository<Creation>,
  ) {
    this.logger = new Logger();
    this.paginationLimit = this.configService.get<number>('paginationLimit');
  }

  async create(createUserDto: CreateUserDto) {
    /* Si trae creations se queda el array que viene, si no, se hace un array vacío */
    const { creations = [], ...userDto } = createUserDto;

    const user = this.usersRepository.create({
      ...userDto,
      creations: creations.map((creation) => this.creationsRepository.create(creation)),
    }); // esta línea sólo crea la instancia del usuario, todavía no la grabó en base de datos

    try {
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll(paginationDto: PaginationDto): Promise<User[]> {
    const { limit = this.paginationLimit, offset = 0 } = paginationDto;
    // console.log(limit, offset);
    const users = this.usersRepository.find({ take: limit, skip: offset }); // take = toma el número de datos solicitado por paginationLimit | skip: se salta el número de resultados solicitados por offset

    if (!users) throw new NotFoundException('No se han encontrado usuarios.');

    return users;
  }

  async findOne(term: string): Promise<User> {
    let user: User;

    if (isUuid(term)) {
      user = await this.usersRepository.findOneBy({ user_id: term });
    } else {
      const query = this.usersRepository.createQueryBuilder();
      /* Esto está super guay! Es un Where clásico de MySQL sin tener que escribir ninguna claúsula, y TypeORM lo hace super flexible! */

      user = await query
        .where('nickname LIKE :nickname OR email LIKE :email', {
          nickname: `%${term}%`,
          email: `%${term}%`,
        })
        .getOne();
    }

    if (!user) throw new NotFoundException('No hay ningún usuario que aplique a tu búsqueda.');

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.preload({ user_id: id, ...updateUserDto }); // Precarga una entidad de la base de datos en base a su llave primaria. Si no encontró nada entonces la instancia creada estará vacía.

    if (!user)
      // BadRequestException me lo trae de serie Nest
      throw new BadRequestException(`El usuario con id ${id} no existe y no se actualizó.`);

    try {
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id); // si no encuentra el usuario este método ya tira Exception

    try {
      await this.usersRepository.delete({ user_id: id }); // esta operación ni siquiera checkea si existe el usuario en DB así que hay que hacer una comprobación manual
      return `El usuario con id ${id} fue eliminado.`;
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
