import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

import { GetUserInCreationDto } from './get-creation-response.dto';

export class GetPublicCreationResponseDto {
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
    example: false,
    description:
      'La creación proporcionada para esta feature siempre será pública (is_draft = false).',
  })
  @IsBoolean()
  is_draft: boolean;

  @ApiProperty({
    example: 'Una obra creada por AgathaChristie.',
    description: 'Sinopsis de la creación',
  })
  @IsString()
  synopsis: string;

  @ApiProperty({ example: null, description: 'Descripción extendida de la creación' })
  @IsOptional()
  description: string | null;

  @ApiProperty({
    example: 'https://example.com/thumbnails/viaje.jpg',
    description: 'URL de la miniatura de la creación',
  })
  @IsString()
  thumbnail: string;

  @ApiProperty({ example: '2025-07-09T16:28:37.000Z', description: 'Fecha de creación' })
  @IsString()
  creation_date: string;

  @ApiProperty({ example: '2025-07-09T16:28:37.000Z', description: 'Fecha de última modificación' })
  @IsString()
  modification_date: string;

  @ApiProperty({
    example: {
      user_id: 'dea601c8-697b-477c-aa09-ba4dd238d7f2',
      nickname: 'AgathaChristie',
      email: 'agatha.christie@mail.com',
      profile_picture: 'https://example.com/avatar1.png',
      description: 'Maestra del misterio y el crimen.',
    },
    description: 'Datos del usuario autor de la creación',
    type: () => GetUserInCreationDto,
  })
  user: GetUserInCreationDto;
}
