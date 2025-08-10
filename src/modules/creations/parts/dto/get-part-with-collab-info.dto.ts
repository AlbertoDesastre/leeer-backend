import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsEnum } from 'class-validator';

import { GetPartResponseDto } from './get-part-response.dto';

export enum COLLABORATION_TYPE {
  CANON = 'canon',
  SPINOFF = 'spinoff',
  FANFICTION = 'fanfiction',
}

export class GetParWithCollabInfoDto extends GetPartResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si es una colaboración proveniente de otro usuario.',
  })
  @IsBoolean()
  isCollaboration: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si el autor original de la obra también es autor de esta parte.',
  })
  @IsBoolean()
  isOriginal: boolean;

  @ApiProperty({
    example: ['canon', 'spin-off'],
    description:
      'Tipo de colaboración para esta parte. Los valores posibles son `canon`, `fanfiction`, `spin-off`. Un fanfiction no puede ser canon por definición y viceversa. ',
  })
  @IsEnum(COLLABORATION_TYPE, { each: true })
  collaborationType: COLLABORATION_TYPE[];
}
