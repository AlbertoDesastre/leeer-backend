import { User } from '@/modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { usersSeed } from '../data';
import { CreateCreationDto } from '@/modules/creations/dto/create-creation.dto';
import { Creation } from '@/modules/creations/entities/creation.entity';
import { CreationsService } from '@/modules/creations/services/creations.service';
import { UsersService } from '@/modules/users/services/users.service';
import { AuthService } from '@/modules/auth/services/auth.service';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Creation) private readonly creationRepository: Repository<Creation>,
    private readonly authService: AuthService,
    private readonly creationService: CreationsService,
  ) {}

  // Utilizo los servicios en vez de los repositorios para insertar porque hay ciertas lógicas como encriptar las contraseñas qeu solo están disponibles ahí.
  async createData() {
    // Como paso previo elimino todo lo anterior
    await this.deleteAllData();

    for (const user of usersSeed) {
      // creo todos los usuarios
      try {
        await this.authService.register(user);
      } catch (error) {
        console.log(error);
      }
      // creo las creaciones genéricas para hacer mis pruebitas
      const creationDto: CreateCreationDto = {
        user_id: user.user_id,
        title: `Obra de ${user.nickname}`,
        synopsis: `Una obra creada por ${user.nickname} como parte del seeder.`,
        isDraft: false,
        thumbnail: `https://example.com/${user.nickname.toLowerCase()}.jpg`,
      };

      try {
        await this.creationService.create(creationDto);
      } catch (error) {
        console.log(error);
      }
    }
    return 'Datos insertados en BD.';
  }

  async deleteAllData() {
    await this.userRepository.deleteAll();
    await this.creationRepository.deleteAll();

    console.log('Se eliminó toda la data antes de ejecutar el seed.');
  }
}
