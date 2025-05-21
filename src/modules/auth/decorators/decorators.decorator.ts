import { SetMetadata } from '@nestjs/common';
import { VALID_ROLES } from '../interfaces/valid-roles';

export const USER_ROLES = 'roles'; // Lo hago constante porque si el día de mañana la palabra "roles" cambia simplemente lo cambio en esta variable y ya. Además, no tengo que acordarme del valor exacto del string

export const ProtectedByRoles = (...args: VALID_ROLES[]) => SetMetadata(USER_ROLES, args); // Esto me ahorra tener que meter los metadatos de los roles que tendrá que recoger y verificar el Guard luego recogiendo el contexto!
