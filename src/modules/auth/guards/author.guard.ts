import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';

import { USER_ROLES } from '../decorators/decorators.decorator';
import { Creation } from '@/modules/creations/entities/creation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { CreationCollaboration } from '@/modules/creations/entities/creation-collaboration.entity';
import { VALID_ROLES } from '../interfaces/valid-roles';

@Injectable()
export class AuthorGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Creation)
    private readonly creationRepository: Repository<Creation>,
    @InjectRepository(CreationCollaboration)
    private readonly creationCollaborationRepository: Repository<CreationCollaboration>,
  ) {}

  // reflector permite leer cualquier metadata que haya sido incluida a través de los decorators, se hace pasándole el nombre del metadato más el contexto. Fuente: https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const creation_id = request.query.id as string;
    const user = request.user; // se que va a venir porque esto vendrá después del Guard de Auth, que me trae el usuario a través de su token JWT
    let roles: VALID_ROLES[] = [];

    if (!creation_id)
      throw new InternalServerErrorException('No hay ningún ID (creation) en la request.');

    const creation = await this.creationRepository.findOne({
      where: { creation_id },
    });

    if (!creation) throw new NotFoundException('No hay ninguna creación asociada a ese ID');

    if (creation.user.user_id === user.user_id) {
      // el usuario que accede al recurso es el autor original y por lo tanto tiene todos los permisos
      roles.push(VALID_ROLES.ORIGINAL_AUTHOR, VALID_ROLES.COLLABORATOR);
    } else {
      // Si no es autor original se verifica si al menos es colaborador
      const collaboration = await this.creationCollaborationRepository.findOne({
        where: {
          creation: { creation_id },
          user: { user_id: user.user_id },
        },
      });

      if (collaboration.approved_by_original_author === true) {
        roles.push(VALID_ROLES.COLLABORATOR);
      } else {
        roles.push(VALID_ROLES.PENDING_COLLABORATOR);
      }
    }

    // Si no encontró ni siquiera una collaboration es que no existe.
    if (roles.length === 0) {
      throw new ForbiddenException(
        'No tienes permitido acceder a este recurso, no eres ni autor ni colaborador.',
      );
    }

    request.user.roles = roles;

    return true;
  }
}
