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

@Injectable()
export class PartsService {
  private logger: Logger;

  constructor(
    @InjectRepository(Part) private readonly partRepository: Repository<Part>,
    @InjectRepository(Creation) private readonly creationRepository: Repository<Creation>,
    private readonly creationService: CreationsService,
  ) {
    this.logger = new Logger();
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

  handleException(error) {
    this.logger.error(error); // en cualquier tipo de error me interesa el logeo.

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }

    throw new InternalServerErrorException('Algo terrible ocurrió en el servidor.');
  }
}
