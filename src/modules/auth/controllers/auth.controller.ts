import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from '@/modules/auth/services/auth.service';
import { RegisterAuthDto } from '@/modules/auth/dto/register-auth.dto';
import { LoginAuthDto } from '@/modules/auth/dto/login-auth.dto';
import { User } from '@/modules/users/entities/user.entity';
import { RolesGuard } from '../guards/auth.guard';
import { GetUser } from '../decorators/get-user.decorator';
import { ProtectedByRoles } from '../decorators/decorators.decorator';
import { VALID_ROLES } from '../interfaces/valid-roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }

  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Get('prueba')
  // Un Guard es una función que permite/previene el acceso a una ruta. Se ejecuta mucho antes que la ruta y el controlador. Fuente: https://docs.nestjs.com/guards
  @UseGuards(AuthGuard())
  prueba(@GetUser() user: User, @GetUser('email') userEmail: string) {
    return { token: user.token, user, userEmail };
  }

  @Get('segunda-prueba')
  // Un Guard es una función que permite/previene el acceso a una ruta. Se ejecuta mucho antes que la ruta y el controlador. Fuente: https://docs.nestjs.com/guards
  @ProtectedByRoles(VALID_ROLES.ORIGINAL_AUTHOR) // Este Guard vacío signfica que dejo entrar a cualquiera (conceptualmente, un guest), y cada rol nuevo que le meta y no cumpla el tipo que me hace la request le salta un Forbiden access
  @UseGuards(AuthGuard(), RolesGuard)
  segundaPrueba(@GetUser() user: User, @GetUser('email') userEmail: string) {
    return { token: user.token, user, userEmail };
  }
}
