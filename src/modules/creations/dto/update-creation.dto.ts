import { PartialType } from '@nestjs/swagger';

import { CreateCreationDto } from './create-creation.dto';

export class UpdateCreationDto extends PartialType(CreateCreationDto) {}
