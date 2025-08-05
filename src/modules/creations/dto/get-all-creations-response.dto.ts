import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

// TODO: ¿Será correcto crear un DTO exclusivo para la respuesta del GetCreation, en vez de usar la entidad "User", aunque esto signifique incluir información que no es relevante para este request como "Parts[]"?
class GetUserInCreationDto {
  @ApiProperty({
    example: 'dea601c8-697b-477c-aa09-ba4dd238d7f2',
    description: 'ID único del usuario autor',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({ example: 'AgathaChristie', description: 'Nickname del usuario autor' })
  @IsString()
  nickname: string;

  @ApiProperty({ example: 'agatha.christie@mail.com', description: 'Email del usuario autor' })
  @IsString()
  email: string;

  @ApiProperty({
    example: 'https://example.com/avatar1.png',
    description: 'URL de la foto de perfil del usuario autor',
  })
  @IsString()
  profile_picture: string;

  @ApiProperty({
    example: 'Maestra del misterio y el crimen.',
    description: 'Descripción del usuario autor',
  })
  @IsString()
  description: string;
}

export class GetAllCreationsResponseDto {
  @ApiProperty({
    example: '1ba24a41-026d-4d4d-aec9-6f30c5ad6444',
    description: 'ID único de la creación',
  })
  @IsUUID()
  creation_id: string;

  @ApiProperty({ example: 'Obra de AgathaChristie', description: 'Título de la creación' })
  @IsString()
  title: string;

  @ApiProperty({ example: false, description: 'Indica si la creación es borrador' })
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
