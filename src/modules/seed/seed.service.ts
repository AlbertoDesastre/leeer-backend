import { User } from '@/modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { usersSeed } from './data';
import { CreateCreationDto } from '@/modules/creations/dto/create-creation.dto';
import { Creation } from '@/modules/creations/entities/creation.entity';
import { CreationsService } from '@/modules/creations/creations.service';

import { AuthService } from '@/modules/auth/services/auth.service';
import { CreateCollaborationPetitionDto } from '@/modules/creations/dto/create-creation-collaboration-petition.dto';
import { CollaborationsService } from '@/modules/creations/collaborations/collaborations.service';
import { PartsService } from '../creations/parts/parts.service';
import { CreatePartDto } from '../creations/parts/dto/create-part.dto';
import { Part } from '../creations/parts/entities/part.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Creation) private readonly creationRepository: Repository<Creation>,
    @InjectRepository(Part) private readonly partRepository: Repository<Part>,
    private readonly authService: AuthService,
    private readonly creationService: CreationsService,
    private readonly collaborationService: CollaborationsService,
    private readonly partService: PartsService,
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
        isDraft: !!Math.round(Math.random()), // esto es equivalente a escoger aleatoriamente entre 0 y 1, que luego transformo a boolean con "!!"
        thumbnail: '',
      };

      try {
        // Para algunas pruebas necesito más de una obra creada por autor
        await this.creationService.create(creationDto);
        await this.creationService.create(creationDto);
        await this.creationService.create(creationDto);
        await this.creationService.create(creationDto);
      } catch (error) {
        console.log(error);
      }
    }

    await this.findAndCreateCollabPetitions();
    await this.createPartsForCreations();

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
        approved_by_original_author: null,
        is_fanfiction: false,
        is_spin_off: true,
        is_canon: true,
      };

      try {
        await this.collaborationService.sendCollaborationPetition(
          collaborator,
          creation,
          collaborationPetition,
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  async createPartsForCreations() {
    const users = await this.userRepository.find();

    // esta operación se hace para cada usuario.
    for (const user of users) {
      // agarro todas las creaciones

      const creations = await this.creationRepository.find({
        where: { user },
      });

      // y a cada creación le añado una parte escrita por su autor original
      for (const creation of creations) {
        for (let i = 1; i <= 3; i++) {
          const createPartDto: CreatePartDto = {
            title: `Parte ${i} de "${creation.title}"`,
            content: `Contenido ficticio de la parte ${i} escrita por ${user.nickname}.`,
            isDraft: !!Math.round(Math.random()), // boolean aleatorio
            thumbnail: `https://example.com/thumbnails/${user.nickname.toLowerCase()}-${i}.jpg`,
          };

          // Me ha dejado de servir el servicio porque para obtener la creation necesita estar en la request. A partir de ahora lo hago
          const part = this.partRepository.create({
            is_draft: createPartDto.isDraft, // tengo que hacer esto porque en el DTO y en la entity la misma columna no se llaman igual
            ...createPartDto,
            creation,
            user,
          });

          try {
            await this.partRepository.save(part);
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  }

  async deleteAllData() {
    await this.userRepository.deleteAll();
    await this.creationRepository.deleteAll();
    // no hace falta deletear las colaboraciones ni partes porque "Creation" tiene borrado en cascada

    console.log('Se eliminó toda la data antes de ejecutar el seed.');
  }
}
