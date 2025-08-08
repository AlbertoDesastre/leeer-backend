import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreatePartDto {
  @ApiProperty({
    example: 'Corría una maravillosa tarde de verano cuando de repente... (...)',
    title: 'Título de la parte.',
  })
  @IsString()
  @MaxLength(100)
  title: string;
  @ApiProperty({
    example: 'Corría una maravillosa tarde de verano cuando de repente... (...)',
    title: 'Texto plano de la parte.',
  })
  @IsString()
  readonly content: string;
  @ApiProperty({
    example: true,
    title: 'Indica si es borrador. Si no se envía nada se queda en "true" por defecto.',
  })
  @IsBoolean()
  @IsOptional()
  readonly isDraft: boolean | null;
  @ApiProperty({
    example: 'https://example.com/thumbnails/viaje.jpg',
    title: 'Foto que acompaña a la parte.',
  })
  @IsString()
  @IsOptional()
  readonly thumbnail?: string;
  /* Los campos "creationDate" y "modificationDate" los autogenera la Entidad al impactar la BBDD, así que no los pongo */
}
