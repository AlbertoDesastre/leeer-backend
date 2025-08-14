import { ApiProperty } from '@nestjs/swagger';

export class GetBasicCollaborationDto {
  @ApiProperty({
    example: '40afee0f-dad9-470e-ac2d-44f4e339ac0a',
    description: 'ID único de la colaboración',
    uniqueItems: true,
  })
  creation_collaboration_id: string;

  @ApiProperty({
    example: true,
    description: 'Aprobado por el autor original',
    default: null,
  })
  approved_by_original_author: boolean | null;

  @ApiProperty({ example: false, description: '¿Es fanfiction?' })
  is_fanfiction: boolean;

  @ApiProperty({ example: true, description: '¿Es spin-off?' })
  is_spin_off: boolean;

  @ApiProperty({ example: true, description: '¿Es canon?' })
  is_canon: boolean;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Fecha de creación en formato ISO',
  })
  creation_date: string;

  @ApiProperty({
    example: '2024-01-02T00:00:00Z',
    description: 'Fecha de última modificación en formato ISO',
  })
  modification_date: string;
}
