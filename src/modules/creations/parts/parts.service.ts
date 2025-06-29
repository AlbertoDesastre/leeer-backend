import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUuid } from 'uuid';

import { User } from '@/modules/users/entities/user.entity';
import { CreationsService } from '@/modules/creations/creations.service';
import { ConfigService } from '@nestjs/config';

import { CreationCollaboration } from '../collaborations/entities/creation-collaboration.entity';
import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';
import { CreatePartDto } from './dto/create-part.dto';
import { Part } from './entities/part.entity';
import { UpdatePartDto } from './dto/update-part.dto';
import { Creation } from '../entities/creation.entity';
import { CollaborationsService } from '../collaborations/collaborations.service';
import { PartWithCollabInfoDto } from './dto/part-with-collab-info.dto';

@Injectable()
export class PartsService {
  private paginationLimit: number;
  private logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Part) private readonly partRepository: Repository<Part>,

    private readonly creationService: CreationsService,
    private readonly collaborationService: CollaborationsService,
  ) {
    this.logger = new Logger();
    this.paginationLimit = this.configService.get<number>('paginationLimit');
  }

  async create(user: User, creat: Creation, createPartDto: CreatePartDto): Promise<Part> {
    const { creation_id } = creat;

    const creation = await this.creationService.findOne(creation_id); // esto ya tira error si no lo encuentra
    // Como ya hago la comprobación de si es colaborador o autor en el Guard me puedo ahorrar una verificación de user_id <3
    const part = this.partRepository.create({
      ...createPartDto,
      creation,
      user,
    });

    try {
      await this.partRepository.save(part);
      delete part.creation.user; // le devuelvo al usuario solo su información de usuario y la parte
      return part;
    } catch (error) {
      this.handleException(error);
    }
  }

  async findOne({
    creation_id,
    id,
    showDrafts,
  }: {
    creation_id: string;
    id: string;
    showDrafts: boolean;
  }): Promise<Part> {
    const condition = showDrafts
      ? { creation: { creation_id }, part_id: id }
      : { creation: { creation_id }, part_id: id, is_draft: false };

    const part: Part = await this.partRepository.findOne({
      where: condition,
    });

    if (!part) throw new NotFoundException('No hay ninguna parte que aplique a tu búsqueda.');

    return part;
  }

  async findAll({
    creation_id,
    paginationDto,
    showDrafts,
  }: {
    creation_id: string;
    paginationDto: PaginationDto;
    showDrafts: boolean;
  }) {
    const { limit = this.paginationLimit, offset = 0 } = paginationDto;

    if (!creation_id)
      throw new BadRequestException('No pasaste el ID de la creation que estás buscando.');

    const creation = await this.creationService.findOne(creation_id); // Recuerdo que este método ya devuelve un NotFound si no lo encuentra.

    if (!creation) throw new NotFoundException('No se han encontrado creaciones.');

    // showDrafts solo se activa en las rutas para autores.
    const condition = showDrafts
      ? { creation: { creation_id } }
      : { creation: { creation_id }, is_draft: false };

    const parts = this.partRepository.find({
      where: condition,
      take: limit,
      skip: offset,
    });

    return parts;
  }

  async findAllWithCollabInfo({
    creation_id,
    paginationDto,
    showDrafts,
  }: {
    creation_id: string;
    paginationDto: PaginationDto;
    showDrafts: boolean;
  }): Promise<PartWithCollabInfoDto[]> {
    const { limit = this.paginationLimit, offset = 0 } = paginationDto;
    if (!creation_id)
      throw new BadRequestException('No pasaste el ID de la creation que estás buscando.');
    const creation = await this.creationService.findOne(creation_id);
    if (!creation) throw new NotFoundException('No hay ninguna creation con este ID.');

    // Obtener todas las colaboraciones aprobadas
    const collaborations = await this.collaborationService.findAllCollaborationPetitionsByCreation(
      creation.user,
      creation,
      { limit, offset },
    );

    /* Lo mismo, si quiero mostrar los Drafts es porque se que el usuario es el creador */
    const condition = showDrafts
      ? { creation: { creation_id } }
      : { creation: { creation_id }, is_draft: false };

    /* Aquí saco la info de quién creo cada parte */
    const parts = await this.partRepository.find({
      where: condition,
      take: limit,
      skip: offset,
      relations: { user: true },
    });

    // Añadir la info extra
    return parts.map((part) => {
      const isOriginal = part.user.user_id === creation.user.user_id;
      let collaborationType: string[] = [];
      if (!isOriginal) {
        // Cojo las colaboraciones de este usuario para esta creación
        const userCollabs = collaborations.filter(
          (collab) =>
            collab.user.user_id === part.user.user_id &&
            collab.approved_by_original_author === true,
        );
        /* Si alguno de estos tipos se encontró lo empujo en el array */
        if (userCollabs.length > 0) {
          if (userCollabs.some((c) => c.is_canon)) collaborationType.push('canon');
          if (userCollabs.some((c) => c.is_spin_off)) collaborationType.push('spinoff');
          if (userCollabs.some((c) => c.is_fanfiction)) collaborationType.push('fanfiction');
        }
      }
      return {
        ...part,
        isCollaboration: !isOriginal,
        isOriginal,
        collaborationType,
      };
    });
  }

  async update(id: string, updateCreationDto: UpdatePartDto) {
    const part = await this.partRepository.preload({
      part_id: id,
      is_draft: updateCreationDto.isDraft,
      ...updateCreationDto,
    }); // Precarga una entidad de la base de datos en base a su llave primaria. Si no encontró nada entonces la instancia creada estará vacía.

    if (!part) throw new BadRequestException(`La parte con id ${id} no existe y no se actualizó.`);

    try {
      await this.partRepository.save(part);
      return part;
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(creation_id: string, id: string) {
    const part = await this.findOne({ creation_id, id, showDrafts: true }); // si no encuentra a creación este método ya tira Exception

    try {
      await this.partRepository.delete(part); // esta operación ni siquiera checkea si existe a creación en DB así que hay que hacer una comprobación manual
      return `La creación con id ${id} fue eliminado.`;
    } catch (error) {
      this.handleException(error);
    }

    return `La parte con ${id} fue borrada con éxito`;
  }

  handleException(error) {
    this.logger.error(error); // en cualquier tipo de error me interesa el logeo.

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }

    throw new InternalServerErrorException('Algo terrible ocurrió en el servidor.');
  }
}
