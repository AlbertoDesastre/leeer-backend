import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsEmail } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'autor@email.com', description: 'Email del usuario', uniqueItems: true })
  @IsEmail()
  readonly email: string;
  @ApiProperty({
    example: 'ContraseñaSegura123!',
    description: 'Contraseña (mínimo 10 caracteres, una mayúscula, un número y un símbolo)',
  })
  @IsString()
  readonly password: string;
}
