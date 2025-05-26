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
import { validate as isUuid } from 'uuid';

import { CreateCreationDto } from '@/modules/creations/dto/create-creation.dto';
import { UpdateCreationDto } from '@/modules/creations/dto/update-creation.dto';
import { Creation } from '@/modules/creations/entities/creation.entity';

import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';
import { User } from '@/modules/users/entities/user.entity';
import { CreationCollaboration } from '../entities/creation-collaboration.entity';
import { CreateCollaborationPetitionDto } from '../dto/create-creation-collaboration-petition.dto';
import { CollaborationPaginationDto } from '@/modules/common/dto/collaborations-pagination-dto.dto';
import { UpdateCreationCollaborationDto } from '../dto/update-creation-collaboration-petition.dto';

@Injectable()
export class CreationsService {
  private paginationLimit: number;
  private logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Creation)
    private readonly creationsRepository: Repository<Creation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CreationCollaboration)
    private readonly creationCollaborationRepository: Repository<CreationCollaboration>,
  ) {
    this.logger = new Logger();
    this.paginationLimit = this.configService.get<number>('paginationLimit');
  }

  async create(createCreationDto: CreateCreationDto) {
    const { user_id, ...creationDto } = createCreationDto;

    const user = await this.userRepository.findOneBy({ user_id });

    if (!user) throw new NotFoundException(`El usuario con id ${user_id} no se encontró`);

    const creation = this.creationsRepository.create({
      user,
      is_draft: creationDto.isDraft,
      ...creationDto,
    }); // esta línea sólo crea la instancia de la creación, todavía no la grabó en base de datos

    try {
      await this.creationsRepository.save(creation);
      return creation;
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll(paginationDto: PaginationDto): Promise<Creation[]> {
    const { limit = this.paginationLimit, offset = 0 } = paginationDto;
    const creations = this.creationsRepository.find({
      where: { is_draft: false }, // solo se mostrarán las creations públicas para los usuarios
      take: limit,
      skip: offset,
      relations: {
        // encontré el modo de regresar toda la data relacionada dios mío T.T
        user: true,
      },
    }); // take = toma el número de datos solicitado por paginationLimit | skip: se salta el número de resultados solicitados por offset

    if (!creations) throw new NotFoundException('No se han encontrado creaciones.');

    return creations;
  }

  async findOne(term: string): Promise<Creation> {
    let creation: Creation;

    if (isUuid(term)) {
      creation = await this.creationsRepository.findOneBy({ creation_id: term, is_draft: false });
      // console.log(creation);
    } else {
      const query = this.creationsRepository.createQueryBuilder('creac');
      /* Esto está super guay! Es un Where clásico de MySQL sin tener que escribir ninguna claúsula, y TypeORM lo hace super flexible! */
      // console.log(term);
      creation = await query
        .where('title LIKE :title AND is_draft = false', { title: `%${term}%` })
        .leftJoinAndSelect('creac.user', 'creacUsers') // en el primer parámetro hay que buscar por el nombre de la entidad "user" de mi entidad "Creation", no por el nombre de la tabla "users"
        .getOne();
    }

    if (!creation)
      throw new NotFoundException('No hay ninguna creación que aplique a tu búsqueda.');

    return creation;
  }

  async update(id: string, updateCreationDto: UpdateCreationDto) {
    const creation = await this.creationsRepository.preload({
      creation_id: id,
      is_draft: updateCreationDto.isDraft,
      ...updateCreationDto,
    }); // Precarga una entidad de la base de datos en base a su llave primaria. Si no encontró nada entonces la instancia creada estará vacía.

    if (!creation)
      // BadRequestException me lo trae de serie Nest
      throw new BadRequestException(`La creación con id ${id} no existe y no se actualizó.`);

    try {
      await this.creationsRepository.save(creation);
      return creation;
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id); // si no encuentra a creación este método ya tira Exception

    try {
      await this.creationsRepository.delete({ creation_id: id }); // esta operación ni siquiera checkea si existe a creación en DB así que hay que hacer una comprobación manual
      return `La creación con id ${id} fue eliminado.`;
    } catch (error) {
      this.handleException(error);
    }
  }

  // Colaboraciones

  // Luego debo tener la opción de ver MIS peticiones.
  // Luego otra llamada para ver una petición concreta, que eso se hace por ID de la petición, en realidad
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
    creation_id: string,
    createCollaborationPetitionDto: CreateCollaborationPetitionDto,
  ) {
    const creation = await this.findOne(creation_id);

    const creationCollab = this.creationCollaborationRepository.create({
      user,
      creation,
      ...createCollaborationPetitionDto,
    });
    console.log(creationCollab);
    try {
      const a = await this.creationCollaborationRepository.save(creationCollab);
      console.log(a);
      return { creation, creationCollab };
    } catch (error) {
      console.log(error);
      this.handleException(error);
    }
  }

  // Comentario del dev: Este es mi método favorito porque mezcla muchas cosas y devuelve un dato bonito y entendible.
  async findAllCollaborationPetitions(
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
    collaborationPaginationDto: CollaborationPaginationDto,
  ): Promise<CreationCollaboration[]> {
    const { id, limit = this.paginationLimit, offset = 0 } = collaborationPaginationDto;
    const { user_id } = user;
    let collaborations: CreationCollaboration[] = [];

    const creation = await this.findOne(id); // Recuerdo que este método ya devuelve un NotFound si no lo encuentra.
    const isAuthor = creation.user.user_id === user_id;

    // El usuario que manda la petición es el autor original y por lo tanto puede ver todas las peticiones de su obra. Si es el peticionador, solo podrá ver las suyas
    const condition = isAuthor
      ? { creation: { creation_id: id } }
      : { creation: { creation_id: id }, user: { user_id } };

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
