import { IsBoolean } from 'class-validator';

export class UpdateCreationCollaborationDto {
  @IsBoolean()
  readonly approved_by_original_author: boolean;
}
