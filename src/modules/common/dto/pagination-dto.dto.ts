import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // este Pipe es de transformación y me permite pasar un número que está en string a un tipo numérico
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  offset?: number;
}
