import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsOptional, IsString, IsStrongPassword, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BasicCreation {
  @ApiProperty({ example: 'Obra de AgathaChristie', description: 'Título de la creación' })
  @IsString()
  title: string;
  @ApiProperty({
    example: 'Una obra creada por AgathaChristie.',
    description: 'Sinopsis de la creación',
  })
  @IsString()
  synopsis: string;
  @ApiProperty({
    example: 'https://example.com/thumbnails/viaje.jpg',
    description: 'URL de la miniatura de la creación',
  })
  @IsString()
  thumbnail: string;
}

export class CreateUserDto {
  @ApiProperty({
    example: 'autor123',
    description: 'Nickname único del usuario',
    uniqueItems: true,
  })
  @IsString()
  readonly nickname: string;

  @ApiProperty({
    example: 'autor@email.com',
    description: 'Email del usuario',
    uniqueItems: true,
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: 'https://example.com/thumbnails/viaje.jpg',
    description: 'URL de la foto de perfil',
  })
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

  @ApiProperty({
    description: 'Creaciones asociadas al usuario (opcional)',
    type: BasicCreation,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BasicCreation) // "ValidateNested" necesita una INSTANCIA de clase, no un objeto plano. Gracias a @Type de "class-transformer" me transforma el tipo que yo le pase como argumento
  creations?: BasicCreation[];
}
