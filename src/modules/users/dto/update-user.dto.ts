import { PartialType } from '@nestjs/mapped-types';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {} // PartialType() devuelve el tipo (clase) con todas sus propiedades en opcional (Fuente: https://docs.nestjs.com/openapi/mapped-types)
