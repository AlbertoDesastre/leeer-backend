import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePartDto } from '../dto/create-part.dto';
import { UpdatePartDto } from '../dto/update-part.dto';

import { Part } from '../entities/part.entity';
import { Creation } from '@/modules/creations/entities/creation.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CreationsService } from '@/modules/creations/services/creations.service';
import { ConfigService } from '@nestjs/config';
import { PartAndCreationPaginationDto } from '../dto/part-and-creation-pagination-dto';
import { CreationCollaboration } from '@/modules/creations/entities/creation-collaboration.entity';

@Injectable()
export class PartsService {
  private paginationLimit: number;
  private logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Part) private readonly partRepository: Repository<Part>,
    @InjectRepository(CreationCollaboration)
    private readonly creationCollaborationRepository: Repository<CreationCollaboration>,
    private readonly creationService: CreationsService,
  ) {
    this.logger = new Logger();
    this.paginationLimit = this.configService.get<number>('paginationLimit');
  }

  async create(user: User, createPartDto: CreatePartDto): Promise<Part> {
    const { creation_id } = createPartDto;

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

  async findAll(partAndCreationPaginationDto: PartAndCreationPaginationDto) {
    const { creation_id, limit = this.paginationLimit, offset = 0 } = partAndCreationPaginationDto;

    if (!creation_id)
      throw new BadRequestException('No pasaste el ID de la creation que estás buscando.');

    const creation = await this.creationService.findOne(creation_id); // Recuerdo que este método ya devuelve un NotFound si no lo encuentra.

    if (!creation) throw new NotFoundException('No se han encontrado creaciones.');

    const parts = this.partRepository.find({
      where: { creation: { creation_id }, is_draft: false },
    });

    return parts;
  }

  handleException(error) {
    this.logger.error(error); // en cualquier tipo de error me interesa el logeo.

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }

    throw new InternalServerErrorException('Algo terrible ocurrió en el servidor.');
  }
}
