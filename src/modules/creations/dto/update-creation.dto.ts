import { PartialType } from '@nestjs/mapped-types';
import { CreateCreationDto } from './create-creation.dto';

export class UpdateCreationDto extends PartialType(CreateCreationDto) {}
