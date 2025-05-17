import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

const ERROR_MESSAGE = {
  WEAK_PASSWORD:
    'Password is not strong enough. It must be at least 10 characters long, have one character in uppercase, one number an one symbol.',
};

export class CreateUserDto {
  @IsEmail()
  readonly email: string;
  @IsString()
  readonly profile_picture: string;
  @IsString()
  readonly description: string;
  @IsString()
  readonly token: string;
  @IsStrongPassword(
    { minLength: 10, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    { message: ERROR_MESSAGE.WEAK_PASSWORD },
  )
  @IsString()
  readonly password: string;
}
