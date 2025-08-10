import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCreationDto {
  @ApiProperty({
    description: 'ID del usuario autor',
    example: 'dea601c8-697b-477c-aa09-ba4dd238d7f2',
  })
  @IsUUID()
  readonly user_id: string;

  @ApiProperty({ description: 'Título de la creación', example: 'Mi novela' })
  @IsString()
  @MinLength(3)
  readonly title: string;

  @ApiProperty({ description: 'Indica si es borrador', example: false })
  @IsBoolean()
  readonly isDraft: boolean;

  @ApiProperty({ description: 'Sinopsis', example: 'Una historia épica...' })
  @IsString()
  @IsOptional()
  readonly synopsis?: string;

  @ApiProperty({ description: 'Descripción extendida', example: 'Descripción larga...' })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiProperty({ description: 'URL de la miniatura', example: 'https://example.com/avatar1.png' })
  @IsString()
  @IsOptional()
  readonly thumbnail?: string;
  /* Los campos "creationDate" y "modificationDate" los autogenera la Entidad al impactar la BBDD, así que no los pongo */
}
