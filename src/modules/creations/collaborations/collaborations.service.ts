import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

import { Creation } from '@/modules/creations/entities/creation.entity';

import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';
import { User } from '@/modules/users/entities/user.entity';

import { CreationCollaboration } from './entities/creation-collaboration.entity';
import { CreateCollaborationPetitionDto } from './dto/create-creation-collaboration-petition.dto';
import { UpdateCreationCollaborationDto } from './dto/update-creation-collaboration-petition.dto';
import { CreationsService } from '../creations.service';
import { CreationWithoutUserDto } from '../dto/creation-without-user.dto';
import { GetCreationCollaborationResponseDto } from './dto/get-creation-collaboration-response.dto';
import { GetBasicCollaborationDto } from './dto/get-basic-collaboration-response.dto';

@Injectable()
export class CollaborationsService {
  private paginationLimit: number;
  private logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CreationCollaboration)
    private readonly creationCollaborationRepository: Repository<CreationCollaboration>,
    private readonly creationService: CreationsService,
  ) {
    this.logger = new Logger();
    this.paginationLimit = this.configService.get<number>('paginationLimit');
  }

  // Colaboraciones
  async getCollaborationPetition(
    user: User,
    creation_collaboration_id: string,
  ): Promise<GetCreationCollaborationResponseDto> {
    const { user_id } = user;

    /*     
Esto estuvo bien para empezar pero se necesitan unos campos concretos para este tipo de respuestas. Lo dejo a modo de consulta.
    const collaboration = await this.creationCollaborationRepository.findOne({
      where: {
        creation_collaboration_id,
      },
    });
 */
    // El usuario que manda la petición es el autor original y por lo tanto puede ver todas las peticiones de su obra. Si es el peticionador, solo podrá ver las suyas
    const select = [
      'collaboration.creation_collaboration_id',
      'collaboration.approved_by_original_author',
      'collaboration.is_fanfiction',
      'collaboration.is_spin_off',
      'collaboration.is_canon',
      'collaboration.creation_date',
      'collaboration.modification_date',
      'creac.title',
      'creac.creation_id',
      'creac.synopsis',
      'creac.thumbnail',
      'creac.user_id',
      'collaborator.user_id',
      'collaborator.nickname',
      'collaborator.profile_picture',
    ];

    const row = await this.creationCollaborationRepository
      .createQueryBuilder('collaboration')
      .leftJoin('collaboration.user', 'collaborator')
      .leftJoin('collaboration.creation', 'creac')
      .leftJoin('creac.user', 'author')
      .select(select)
      .where('collaboration.creation_collaboration_id = :creation_collaboration_id', { creation_collaboration_id })
      .getRawOne();

    const collaboration = this.mapSingleCollaboration(row);

    if (!collaboration)
      throw new NotFoundException(
        'No hay ninguna colaboración relacionada con esta creación que aplique a tu búsqueda.',
      );

    // Si el usuario es colaborador o es el autor original tiene permiso para ver la petición
    if (collaboration.collaborator.user_id != user_id && collaboration.creation.author_id != user_id) {
      throw new ForbiddenException('No puedes ver esta petición porque no es tuya o no eres el autor original.');
    }

    return collaboration;
  }

  async sendCollaborationPetition(
    user: User,
    creat: Creation | CreationWithoutUserDto,
    createCollaborationPetitionDto: CreateCollaborationPetitionDto,
  ) {
    const { creation_id } = creat;
    const creation = await this.creationService.findOne(creation_id);

    const collaboration = this.creationCollaborationRepository.create({
      user,
      creation,
      ...createCollaborationPetitionDto,
    });

    try {
      await this.creationCollaborationRepository.save(collaboration);

      return this.mapSingleCollaboration(collaboration);
    } catch (error) {
      console.log(error);
      this.handleException(error);
    }
  }

  // Comentario del dev: Este es mi método favorito porque mezcla muchas cosas y devuelve un dato bonito y entendible.
  async findAllMyCollaborations(
    user: User,
    paginationDto: PaginationDto,
  ): Promise<GetCreationCollaborationResponseDto[]> {
    const { limit = this.paginationLimit, offset = 0 } = paginationDto;
    const { user_id } = user;
    let collaborations: GetCreationCollaborationResponseDto[] = [];

    const rows = await this.creationCollaborationRepository
      .createQueryBuilder('collaboration')
      .leftJoin('collaboration.user', 'collaborator')
      .leftJoin('collaboration.creation', 'creac')
      .leftJoin('creac.user', 'author')
      .where('collaborator.user_id = :user_id OR author.user_id = :user_id', {
        user_id,
      })
      .select([
        // la colaboración
        'collaboration.creation_collaboration_id',
        'collaboration.approved_by_original_author',
        'collaboration.is_fanfiction',
        'collaboration.is_spin_off',
        'collaboration.is_canon',
        'collaboration.creation_date',
        'collaboration.modification_date',
        // creación solicitada
        'creac.title',
        'creac.creation_id',
        'creac.title',
        'creac.synopsis',
        'creac.thumbnail',
        // datos del colaborador/posible colaborador
        'collaborator.nickname',
        'collaborator.profile_picture',
      ])
      .skip(offset)
      .limit(limit)
      .getRawMany();

    collaborations = this.mapCollaborations(rows);

    if (!collaborations)
      throw new NotFoundException('No has mandado ni recibido ninguna solicitud de colaboración.');

    return collaborations;
  }

  async findAllCollaborationPetitionsByCreation(
    user: User | Omit<User, 'password'>, // TODO: ¿Hay una mejor manera de tipar esto? Se cambió el DTO de Response de algunos GetCreations. Esos DTOS incluyen la entidad usuario sin el atributo "password"
    creat: Creation | CreationWithoutUserDto,
    paginationDto: PaginationDto,
  ): Promise<GetCreationCollaborationResponseDto[]> {
    const { limit = this.paginationLimit, offset = 0 } = paginationDto;
    const { creation_id } = creat;
    const { user_id } = user;

    const creation = await this.creationService.findOne(creation_id); // Recuerdo que este método ya devuelve un NotFound si no lo encuentra.
    const isAuthor = creation.user.user_id === user_id;

    // El usuario que manda la petición es el autor original y por lo tanto puede ver todas las peticiones de su obra. Si es el peticionador, solo podrá ver las suyas
    const select = [
      'collaboration.creation_collaboration_id',
      'collaboration.approved_by_original_author',
      'collaboration.is_fanfiction',
      'collaboration.is_spin_off',
      'collaboration.is_canon',
      'collaboration.creation_date',
      'collaboration.modification_date',
      'creac.title',
      'creac.creation_id',
      'creac.synopsis',
      'creac.thumbnail',
      'collaborator.nickname',
      'collaborator.profile_picture',
    ];

    const query = this.creationCollaborationRepository
      .createQueryBuilder('collaboration')
      .leftJoin('collaboration.user', 'collaborator')
      .leftJoin('collaboration.creation', 'creac')
      .leftJoin('creac.user', 'author')
      .select(select)
      .skip(offset)
      .limit(limit);

    // El usuario que manda la petición es el autor original y por lo tanto puede ver todas las peticiones de su obra. Si es el peticionador, solo podrá ver las suyas
    if (isAuthor) {
      query.where('creac.creation_id = :creation_id', { creation_id });
    } else {
      query.where('creac.creation_id = :creation_id AND collaboration.user = :user_id', {
        creation_id,
        user_id,
      });
    }

    const rows = await query.getRawMany();

    if (!rows || rows.length === 0) {
      throw new NotFoundException(
        isAuthor
          ? 'No tienes ninguna petición de colaboración para esta obra.'
          : 'No has mandado ninguna solicitud de colaboración a esta creación.',
      );
    }

    const collaborations = this.mapCollaborations(rows);

    return collaborations;
  }

  async updateCollaborationPetition(
    creation_collaboration_id: string,
    updateCreationCollaborationDto: UpdateCreationCollaborationDto,
  ): Promise<GetBasicCollaborationDto> {
    let collaboration = await this.creationCollaborationRepository.preload({
      creation_collaboration_id,
      ...updateCreationCollaborationDto,
    });

    if (!collaboration)
      // BadRequestException me lo trae de serie Nest
      throw new BadRequestException(
        `La petición de colaboración con id ${creation_collaboration_id} no existe y no se actualizó.`,
      );

    try {
      await this.creationCollaborationRepository.save(collaboration);
      // no hace falta mapear porque esto es solo datos de la collaboration
      return collaboration;
    } catch (error) {
      this.handleException(error);
    }

    return collaboration;
  }

  async deleteCollaborationPetition(user: User, creation_collaboration_id: string) {
    let collaboration = await this.getCollaborationPetition(user, creation_collaboration_id);

    try {
      await this.creationCollaborationRepository.delete({
        creation_collaboration_id: collaboration.creation_collaboration_id,
      });
      return `La petición con id ${creation_collaboration_id} fue eliminada.`;
    } catch (error) {
      this.handleException(error);
    }
  }

  mapSingleCollaboration(row): GetCreationCollaborationResponseDto {
    if (!row) throw new Error('No se puede mapear una fila nula o undefined');

    let collaboration: GetCreationCollaborationResponseDto;

    // Esto está así definido para que pueda mapear tanto instancias de CreationCollaboration como rows crudas de BBDD. La responsabilidad de mapear los datos recae totalmente en este método.
    if (row instanceof CreationCollaboration) {
      collaboration = {
        creation_collaboration_id: row.creation_collaboration_id,
        approved_by_original_author: !!row.approved_by_original_author,
        is_fanfiction: !!row.is_fanfiction,
        is_spin_off: !!row.is_spin_off,
        is_canon: !!row.is_canon,
        creation_date: row.creation_date,
        modification_date: row.modification_date,
        creation: {
          author_id: row.creation.user.user_id,
          creation_id: row.creation.creation_id,
          title: row.creation.title,
          synopsis: row.creation.synopsis,
          thumbnail: row.creation.thumbnail,
        },
        collaborator: {
          user_id: row.user.user_id,
          nickname: row.user.nickname,
          profile_picture: row.user.profile_picture,
        },
      };
    } else {
      collaboration = {
        creation_collaboration_id: row.creationCollab_creation_collaboration_id,
        approved_by_original_author: !!row.creationCollab_approved_by_original_author,
        is_fanfiction: !!row.creationCollab_is_fanfiction,
        is_spin_off: !!row.creationCollab_is_spin_off,
        is_canon: !!row.creationCollab_is_canon,
        creation_date: row.creationCollab_creation_date,
        modification_date: row.creationCollab_modification_date,
        creation: {
          author_id: row.creac_user_id,
          creation_id: row.creac_creation_id,
          title: row.creac_title,
          synopsis: row.creac_synopsis,
          thumbnail: row.creac_thumbnail,
        },
        collaborator: {
          user_id: row.collaborator_user_id,
          nickname: row.collaborator_nickname,
          profile_picture: row.collaborator_profile_picture,
        },
      };
    }

    return collaboration;
  }

  mapCollaborations(rows): GetCreationCollaborationResponseDto[] {
    if (!Array.isArray(rows)) throw new Error('Se esperaba una lista de datos y no se pudo mapear la data.');

    let collaborations: GetCreationCollaborationResponseDto[] = rows.map((r) => this.mapSingleCollaboration(r));

    return collaborations;
  }

  handleException(error) {
    this.logger.error(error); // en cualquier tipo de error me interesa el logeo.

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }

    throw new InternalServerErrorException('Algo terrible ocurrió en el servidor.');
  }
}
