import { Creation } from '@/modules/creations/entities/creation.entity';
import { IsEmail, IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly nickname: string;
  @IsEmail()
  readonly email: string;
  @IsString()
  readonly profile_picture: string;
  @IsString()
  readonly description: string;
  @IsStrongPassword(
    { minLength: 10, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    {
      message:
        'La contraseña no es lo suficientemente segura. Debe tener al menos 10 caracteres, un carácter en mayúscula, un número y un símbolo.',
    },
  )
  @IsString()
  readonly password: string;

  @IsOptional()
  creations?: Creation[];
}
