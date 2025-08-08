import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsUUID, IsBoolean } from 'class-validator';

class GetPartCreationDto {
  @ApiProperty({
    example: '124e6a3c-a559-49fa-b678-f32dcd809ddc',
    description: 'ID único de la creación',
  })
  @IsUUID()
  creation_id: string;
  @ApiProperty({ example: 'Obra de PhilipKDick', description: 'Título de la creación' })
  @IsString()
  title: string;
  @ApiProperty({ example: false, description: 'Indica si la creación es borrador' })
  @IsBoolean()
  is_draft: boolean;
  @ApiProperty({
    example: 'Una obra creada por PhilipKDick.',
    description: 'Sinopsis de la creación',
  })
  @IsString()
  synopsis: string;
  @ApiProperty({ example: null, description: 'Descripción extendida de la creación' })
  @IsString()
  description: string | null;
  @ApiProperty({ example: '', description: 'URL de la miniatura de la creación' })
  @IsString()
  thumbnail: string;
  @ApiProperty({ example: '2025-08-05T17:37:05.000Z', description: 'Fecha de creación' })
  @IsString()
  creation_date: string;
  @ApiProperty({ example: '2025-08-05T17:37:05.000Z', description: 'Fecha de última modificación' })
  @IsString()
  modification_date: string;
}

class GetPartUserDto {
  @ApiProperty({
    example: '2c44df6c-39b1-4646-b6f2-fbf0e08a9c4d',
    description: 'ID único del usuario autor de la parte',
  })
  @IsUUID()
  user_id: string;
  @ApiProperty({ example: 'PhilipKDick', description: 'Nickname del usuario autor de la parte' })
  @IsString()
  nickname: string;
  @ApiProperty({ example: 'pkd@reality.net', description: 'Email del usuario autor de la parte' })
  @IsString()
  email: string;
  @ApiProperty({
    example: 'https://example.com/avatar8.jpg',
    description: 'URL de la foto de perfil del usuario autor de la parte',
  })
  @IsString()
  profile_picture: string;
  @ApiProperty({
    example: 'Narrador de realidades alternativas.',
    description: 'Descripción del usuario autor de la parte',
  })
  @IsString()
  description: string;
}

export class GetPartWithFullDetailDto {
  @ApiProperty({
    example: 'Corría una maravillosa tarde de verano cuando de repente... (...)',
    description: 'Título de la parte',
  })
  @IsString()
  title: string;
  @ApiProperty({
    example: 'Corría una maravillosa tarde de verano cuando de repente... (...)',
    description: 'Contenido de la parte',
  })
  @IsString()
  content: string;
  @ApiProperty({ type: () => GetPartCreationDto, description: 'Datos de la creación asociada' })
  creation: GetPartCreationDto;
  @ApiProperty({ type: () => GetPartUserDto, description: 'Datos del usuario autor de la parte' })
  user: GetPartUserDto;
  @ApiProperty({
    example: '74d35acb-b289-471c-8c4f-84a3648f1d89',
    description: 'ID único de la parte',
  })
  @IsUUID()
  part_id: string;
  @ApiProperty({
    example: '2025-08-07T08:43:17.000Z',
    description: 'Fecha de creación de la parte',
  })
  @IsString()
  creation_date: string;
  @ApiProperty({
    example: '2025-08-07T08:43:17.000Z',
    description: 'Fecha de última modificación de la parte',
  })
  @IsString()
  modification_date: string;
}
