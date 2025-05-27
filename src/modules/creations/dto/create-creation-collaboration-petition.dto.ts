import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateCollaborationPetitionDto {
  @IsBoolean()
  @IsOptional()
  @Transform(() => null) // me da igual lo que reciba porque siempre será NULL, pendiente de aprobación
  readonly approved_by_original_author: boolean | null;
  @IsBoolean()
  readonly is_fanfiction: boolean;
  @IsBoolean()
  readonly is_spin_off: boolean;
  @IsBoolean()
  readonly is_canon: boolean;
}
