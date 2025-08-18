import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsEmail, IsStrongPassword } from 'class-validator';

export class RegisterAuthDto {
  @ApiProperty({ example: 'autor123', description: 'Nickname único del usuario', uniqueItems: true })
  @IsString()
  readonly nickname: string;

  @ApiProperty({ example: 'autor@email.com', description: 'Email del usuario', uniqueItems: true })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'https://example.com/thumbnails/viaje.jpg', description: 'URL de la foto de perfil' })
  @IsString()
  readonly profile_picture: string;

  @ApiProperty({ example: 'Escritor de novelas...', description: 'Descripción del usuario' })
  @IsString()
  readonly description: string;

  @ApiProperty({
    example: 'ContraseñaSegura123!',
    description: 'Contraseña (mínimo 10 caracteres, una mayúscula, un número y un símbolo)',
  })
  @IsStrongPassword(
    { minLength: 10, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    {
      message:
        'La contraseña no es lo suficientemente segura. Debe tener al menos 10 caracteres, un carácter en mayúscula, un número y un símbolo.',
    },
  )
  @IsString()
  readonly password: string;
}
