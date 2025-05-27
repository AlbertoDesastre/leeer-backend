import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePartDto } from './create-part.dto';

// esto me quita la posibilidad de editar el creation_id
export class UpdatePartDto extends PartialType(OmitType(CreatePartDto, ['creation_id'] as const)) {}
