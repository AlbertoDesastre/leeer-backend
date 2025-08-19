import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { PaginationDto } from '@/modules/common/dto/pagination-dto.dto';

export class PaginatedPendingCollaborationsDto extends PaginationDto {
  @ApiProperty({
    default: null,
    example: true,
    description:
      'Si se incluye como parte del query solo devolverá aquellas colaboraciones entrantes pendientes de aprobación.',
  })
  @IsOptional()
  @Type(() => Boolean)
  pending?: boolean;
}
