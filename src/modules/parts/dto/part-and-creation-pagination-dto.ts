import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';
import { IsUUID, IsString } from 'class-validator';

export class PartAndCreationPaginationDto extends PaginationDto {
  @IsString()
  @IsUUID()
  creation_id: string;
}
