import { IsUUID, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class CreatePartDto {
  @IsUUID()
  creation_id: string;
  @IsString()
  readonly content: string;
  @IsBoolean()
  readonly isDraft: boolean;
  @IsString()
  @IsOptional()
  readonly thumbnail?: string;
  /* Los campos "creationDate" y "modificationDate" los autogenera la Entidad al impactar la BBDD, así que no los pongo */
}
