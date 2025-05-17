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

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  private paginationLimit: number;
  private logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    this.logger = new Logger();
    this.paginationLimit = this.configService.get<number>('paginationLimit');
    /* Esto es un ejemplo de uso para cuando tenga que paginar partes/creaciones 
     console.log('hola!', this.paginationLimit); */
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto); // esta línea sólo crea la instancia del usuario, todavía no la grabó en base de datos

    try {
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll(): Promise<User[]> {
    const users = this.usersRepository.find();

    if (!users) throw new NotFoundException('No se han encontrado usuarios.');

    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ user_id: id });

    if (!user) throw new NotFoundException('No hay ningún usuario con este id.');

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
