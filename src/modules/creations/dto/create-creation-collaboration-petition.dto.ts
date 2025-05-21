import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCollaborationPetitionDto {
  @IsBoolean()
  @Transform(() => false) // me da igual lo que reciba porque siempre será falso, pendiente de aprobación
  readonly approved_by_original_author: boolean;
  @IsBoolean()
  readonly is_fanfiction: boolean;
  @IsBoolean()
  readonly is_spin_off: boolean;
  @IsBoolean()
  readonly is_canon: boolean;
}
