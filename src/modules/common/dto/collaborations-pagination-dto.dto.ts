import { IsString, IsUUID } from 'class-validator';

import { PaginationDto } from './pagination-dto.dto';

export class CollaborationPaginationDto extends PaginationDto {
  @IsString()
  @IsUUID()
  id: string;
}
