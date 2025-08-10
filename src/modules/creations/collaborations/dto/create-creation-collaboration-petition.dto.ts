import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateCollaborationPetitionDto {
  @ApiPropertyOptional({
    description:
      'Aprobado por el autor original. Al mandar una solicitud de colaboración siempre tiene el valor "null", indicando que está pendiente de aprobación.',
    example: null,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(() => null) // me da igual lo que reciba porque siempre será NULL, pendiente de aprobación
  readonly approved_by_original_author: boolean | null;
  @ApiProperty({ description: '¿Es fanfiction?', example: false })
  @IsBoolean()
  readonly is_fanfiction: boolean;
  @ApiProperty({ description: '¿Es spin-off?', example: true })
  @IsBoolean()
  readonly is_spin_off: boolean;
  @ApiProperty({ description: '¿Es canon?', example: true })
  @IsBoolean()
  readonly is_canon: boolean;
}
