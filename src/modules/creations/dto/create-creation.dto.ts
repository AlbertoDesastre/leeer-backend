import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCreationDto {
  @IsString()
  @MinLength(3)
  readonly title: string;
  @IsBoolean()
  readonly isDraft: boolean;
  @IsString()
  @IsOptional()
  readonly synopsis?: string;
  @IsString()
  @IsOptional()
  readonly description?: string;
  @IsString()
  @IsOptional()
  readonly thumbnail?: string;
  /* Los campos "creationDate" y "modificationDate" los autogenera la Entidad al impactar la BBDD, así que no los pongo */
}
