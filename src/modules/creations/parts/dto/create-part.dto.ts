import { IsUUID, IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreatePartDto {
  @IsString()
  @MaxLength(100)
  title: string;
  @IsString()
  readonly content: string;
  @IsBoolean()
  @IsOptional()
  readonly isDraft: boolean | null;
  @IsString()
  @IsOptional()
  readonly thumbnail?: string;
  /* Los campos "creationDate" y "modificationDate" los autogenera la Entidad al impactar la BBDD, así que no los pongo */
}
