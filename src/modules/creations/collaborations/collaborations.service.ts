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

  async getCollaborationPetition(user: User, creation_collaboration_id: string): Promise<CreationCollaboration> {
    const { user_id } = user;

    const collaboration = await this.creationCollaborationRepository.findOne({
      where: {
        creation_collaboration_id,
      },
    });

    if (!collaboration)
      throw new NotFoundException(
        'No hay ninguna colaboración relacionada con esta creación que aplique a tu búsqueda.',
      );

    // Si el usuario es colaborador o es el autor original tiene permiso para ver la petición
    if (collaboration.user.user_id != user_id && collaboration.creation.user.user_id != user_id) {
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

    const creationCollab = this.creationCollaborationRepository.create({
      user,
      creation,
      ...createCollaborationPetitionDto,
    });

    try {
      await this.creationCollaborationRepository.save(creationCollab);

      return { creationCollab };
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
  ) {
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

  mapCollaborations(rows): GetCreationCollaborationResponseDto[] {
    let collaborations: GetCreationCollaborationResponseDto[];

    collaborations = rows.map((r) => ({
      creation_collaboration_id: r.creationCollab_creation_collaboration_id,
      approved_by_original_author: !!r.creationCollab_approved_by_original_author,
      is_fanfiction: !!r.creationCollab_is_fanfiction,
      is_spin_off: !!r.creationCollab_is_spin_off,
      is_canon: !!r.creationCollab_is_canon,
      creation_date: r.creationCollab_creation_date,
      modification_date: r.creationCollab_modification_date,
      creation: {
        creation_id: r.creac_creation_id,
        title: r.creac_title,
        synopsis: r.creac_synopsis,
        thumbnail: r.creac_thumbnail,
      },
      collaborator: {
        nickname: r.collaborator_nickname,
        profile_picture: r.collaborator_profile_picture,
      },
    }));

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
