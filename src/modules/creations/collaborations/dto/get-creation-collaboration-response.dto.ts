import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsUUID } from 'class-validator';

class LowDetailCollaborator {
  @ApiProperty({
    example: '3625966b-1ef3-4650-bc3c-07616d83f5f1',
    description: 'ID único del usuario.',
  })
  user_id: string;
  @ApiProperty({
    example: 'TerryP',
    description: 'Nickname del usuario.',
  })
  nickname: string;
  @ApiProperty({
    example: 'https://example.com/thumbnails/viaje.jpg',
    description: 'Imagend e perfil del usuario.',
  })
  profile_picture: string;
}

class LowDetailCreation {
  @ApiProperty({
    example: '1ba24a41-026d-4d4d-aec9-6f30c5ad6444',
    description: 'ID único de la creación',
  })
  @IsUUID()
  creation_id: string;
  @ApiProperty({ example: 'Obra de AgathaChristie', description: 'Título de la creación' })
  @IsString()
  title: string;
  @ApiProperty({
    example: 'Una obra creada por AgathaChristie.',
    description: 'Sinopsis de la creación',
  })
  @IsString()
  synopsis: string;
  @ApiProperty({
    example: 'https://example.com/thumbnails/viaje.jpg',
    description: 'URL de la miniatura de la creación',
  })
  @IsString()
  thumbnail: string;
  @ApiProperty({
    example: '25b997e4-c1fb-46a9-adbc-006d6261a482',
    description: 'ID único del autor original de la obra a la que se le está solicitando una colaboración',
  })
  @IsUUID()
  author_id: string;
}

export class GetCreationCollaborationResponseDto {
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

  @ApiProperty({
    example: {
      creation_id: '9e03212c-3578-4723-9867-4ab64b4426f0',
      title: 'Obra de RayBradbury',
      synopsis: 'Una obra creada por RayBradbury como parte del seeder.',
      thumbnail: '',
    },
    description: 'Creación a la que se ha solicitado una colaboración.',
    type: () => LowDetailCreation,
  })
  creation: LowDetailCreation;

  @ApiProperty({
    example: { nickname: 'TerryPratchett', profile_picture: 'https://example.com/avatar6.jpg' },
    description: 'Usuario que quiere colaborar o está colaborando',
    type: () => LowDetailCollaborator,
  })
  collaborator: LowDetailCollaborator;
}
