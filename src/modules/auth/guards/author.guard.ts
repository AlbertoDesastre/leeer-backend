import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';

import { Creation } from '@/modules/creations/entities/creation.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { CreationCollaboration } from '@/modules/creations/collaborations/entities/creation-collaboration.entity';
import { VALID_ROLES } from '../interfaces/valid-roles';

@Injectable()
export class AuthorGuard implements CanActivate {
  constructor(
    @InjectRepository(Creation)
    private readonly creationRepository: Repository<Creation>,
    @InjectRepository(CreationCollaboration)
    private readonly creationCollaborationRepository: Repository<CreationCollaboration>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { creation_id } = request.params as { creation_id: string };
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

      if (!collaboration)
        throw new ForbiddenException(
          'No puedes acceder a este recurso (falta de permisos de colaboración).',
        );

      if (collaboration.approved_by_original_author === true) {
        roles.push(VALID_ROLES.COLLABORATOR);
        console.log('collab');
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

    // Elimino toda la data sobrante. TODO = Desactivar el eager relations para evitar estas cosas.
    delete creation.user;
    delete creation.parts;
    delete creation.creation_collaborations;

    request.creation = creation;
    request.user.roles = roles;

    return true;
  }
}
