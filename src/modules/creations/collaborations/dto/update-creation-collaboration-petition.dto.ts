import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean } from 'class-validator';

export class UpdateCreationCollaborationDto {
  @ApiProperty({
    example: true,
    description: 'Propiedad que describe si la colaboración está siendo aprobada o no por el autor.',
  })
  @IsBoolean()
  readonly approved_by_original_author: boolean;
}
