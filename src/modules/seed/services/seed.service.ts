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
import { CreateCollaborationPetitionDto } from '@/modules/creations/dto/create-creation-collaboration-petition.dto';

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

    await this.findAndCreateCollabPetitions();

    return 'Datos insertados en BD.';
  }

  async findAndCreateCollabPetitions() {
    const creations = await this.creationService.findAll({ limit: 99, offset: 0 });
    const allUsers = await this.userRepository.find();

    for (const creation of creations) {
      const authorId = creation.user.user_id;

      // Selecciono un usuario que no sea autor original
      const collaborator = allUsers[Math.floor(Math.random() * allUsers.length)]; // Selecciono un usuario al azar para que el colaborador no sea siempre el mismo

      // no ser colaborador es equivalente a ser el autor original, así que se pasa al siguiente
      if (collaborator.user_id === authorId) continue;

      const collaborationPetition: CreateCollaborationPetitionDto = {
        approved_by_original_author: false,
        is_fanfiction: false,
        is_spin_off: true,
        is_canon: true,
      };

      try {
        await this.creationService.sendCollaborationPetition(
          collaborator,
          creation.creation_id,
          collaborationPetition,
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  async deleteAllData() {
    await this.userRepository.deleteAll();
    await this.creationRepository.deleteAll();
    // no hace falta deletear las colaboraciones porque "Creation" tiene borrado en cascada

    console.log('Se eliminó toda la data antes de ejecutar el seed.');
  }
}
