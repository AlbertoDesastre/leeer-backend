import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

/* REVISAR CÓMO SE HACE ESTO BIEN EN EL TUTORIAL */
export class PaginationDto {
  @ApiProperty({ default: 5, description: 'Cuántos resultados quieres traer', example: 10 })
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // este Pipe es de transformación y me permite pasar un número que está en string a un tipo numérico
  limit?: number;

  @ApiProperty({ default: 0, description: 'Cuántos resultados vas a saltarte', example: 1 })
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}
