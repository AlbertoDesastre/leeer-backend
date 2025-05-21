import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { VALID_ROLES } from '../interfaces/valid-roles';
import { USER_ROLES } from './decorators.decorator';
import { RolesGuard } from '../guards/auth.guard';

/* Esto es composición de decoradores. Puedo activar varios decoradores en secuencia para ahorrarme líneas de código. Fuente: https://docs.nestjs.com/custom-decorators#decorator-composition */
export function Authenticate(...roles: VALID_ROLES[]) {
  /* Un breve recordatorio de cada paso */
  return applyDecorators(
    SetMetadata(USER_ROLES, roles), // En la Request se insertan los Roles que configuro en el controlador. Estos roles de la request son revisados por el RolesGuard y decidir si el usuario entrante tiene suficiente autorización o no para acceder al recurso
    UseGuards(
      // Se usan los Guards (que se ejecutan antes de la ruta)
      AuthGuard(), // AuthGuard aplica la estrategia JWT, que en mi caso consiste en verificar que el Token JWT es real y que el usuario sacado del payload de verdad existe en BBDD.
      RolesGuard, // Compruebo los roles del usuario. Si el rol que necesita (establecido en el parámetro "roles" más arriba) no lo tiene entonces es que no tiene permiso para pasar.
    ),
  );
}
