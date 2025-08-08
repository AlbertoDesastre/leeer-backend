import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsBoolean, IsUUID, IsNumber } from 'class-validator';

export class GetPartResponseDto {
  @ApiProperty({
    example: '1ba24a41-026d-4d4d-aec9-6f30c5ad6444',
    description: 'ID único de la parte',
  })
  @IsUUID()
  part_id: string;

  @ApiProperty({ example: 'Parte I: Inicio', description: 'Título de la parte' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'La parte comienza de la siguiente forma...',
    description: 'El contenido de la parte/capítulo',
  })
  @IsString()
  content: string;

  @ApiProperty({
    example: '3000',
    description: 'Número de palabras escritas',
  })
  @IsNumber()
  word_count: number | null;

  @ApiProperty({
    example: '30m',
    description: 'Tiempo estimado de lectura',
  })
  @IsNumber()
  reading_time: number | null;

  @ApiProperty({
    example: 'https://example.com/thumbnails/viaje.jpg',
    description: 'URL de la miniatura de la creación',
  })
  @IsString()
  thumbnail: string;

  @ApiProperty({ example: false, description: 'Indica si la parte es borrador' })
  @IsBoolean()
  is_draft: boolean;

  @ApiProperty({ example: '2025-07-09T16:28:37.000Z', description: 'Fecha de creación' })
  @IsString()
  creation_date: string;

  @ApiProperty({ example: '2025-07-09T16:28:37.000Z', description: 'Fecha de última modificación' })
  @IsString()
  modification_date: string;
}
