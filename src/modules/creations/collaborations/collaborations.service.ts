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
import { CreateCollaborationPetitionDto } from '../dto/create-creation-collaboration-petition.dto';
import { UpdateCreationCollaborationDto } from '../dto/update-creation-collaboration-petition.dto';
import { CreationsService } from '../creations.service';

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
  ): Promise<CreationCollaboration> {
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
      throw new ForbiddenException(
        'No puedes ver esta petición porque no es tuya o no eres el autor original.',
      );
    }

    return collaboration;
  }

  async sendCollaborationPetition(
    user: User,
    creat: Creation,
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
  ): Promise<{ received: CreationCollaboration[]; sent: CreationCollaboration[] }> {
    const { limit = this.paginationLimit, offset = 0 } = paginationDto;
    const { user_id } = user;
    let collaborations: CreationCollaboration[] = [];

    const query = this.creationCollaborationRepository
      .createQueryBuilder('creationCollab')
      .leftJoinAndSelect('creationCollab.user', 'collabUser')
      .leftJoinAndSelect('creationCollab.creation', 'creac')
      .leftJoinAndSelect('creac.user', 'authorUser')
      .where('creationCollab.user.user_id = :user_id OR creac.user.user_id = :user_id', {
        user_id,
      })
      .skip(offset)
      .limit(limit)
      .getMany();

    collaborations = await query;

    if (!collaborations)
      throw new NotFoundException('No has mandado ni recibido ninguna solicitud de colaboración.');

    let received: CreationCollaboration[] = [];
    let sent: CreationCollaboration[] = [];

    collaborations.forEach((collaboration) => {
      if (collaboration.user.user_id === user_id) sent.push(collaboration); // acumula todas las colaboraciones que este usuario mandó a otros autores.
      if (collaboration.creation.user.user_id === user_id) received.push(collaboration); // aquí el autor que manda esta request observa las peticiones recibidas por otros usuarios
    });

    return { received, sent };
  }

  async findAllCollaborationPetitionsByCreation(
    user: User,
    creat: Creation,
    paginationDto: PaginationDto,
  ): Promise<CreationCollaboration[]> {
    const { limit = this.paginationLimit, offset = 0 } = paginationDto;
    const { creation_id } = creat;
    const { user_id } = user;
    let collaborations: CreationCollaboration[] = [];

    const creation = await this.creationService.findOne(creation_id); // Recuerdo que este método ya devuelve un NotFound si no lo encuentra.
    const isAuthor = creation.user.user_id === user_id;

    // El usuario que manda la petición es el autor original y por lo tanto puede ver todas las peticiones de su obra. Si es el peticionador, solo podrá ver las suyas
    const condition = isAuthor
      ? { creation: { creation_id } }
      : { creation: { creation_id }, user: { user_id } };

    collaborations = await this.creationCollaborationRepository.find({
      take: limit,
      skip: offset,
      where: condition,
    });

    if (collaborations.length === 0) {
      throw new NotFoundException(
        isAuthor
          ? 'No tienes ninguna petición de colaboración para esta obra.'
          : 'No has mandado ninguna solicitud de colaboración a esta creación.',
      );
    }

    return collaborations;
  }

  async updateCollaborationPetition(
    creation_collaboration_id: string,
    updateCreationCollaborationDto: UpdateCreationCollaborationDto,
  ): Promise<CreationCollaboration> {
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

  handleException(error) {
    this.logger.error(error); // en cualquier tipo de error me interesa el logeo.

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }

    throw new InternalServerErrorException('Algo terrible ocurrió en el servidor.');
  }
}
