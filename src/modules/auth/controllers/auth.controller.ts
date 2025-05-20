import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from '@/modules/auth/services/auth.service';

import { RegisterAuthDto } from '@/modules/auth/dto/register-auth.dto';
import { LoginAuthDto } from '@/modules/auth/dto/login-auth.dto';
import { Auth } from '../entities/auth.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from '@/modules/users/entities/user.entity';
import { RolesGuard } from '../guards/auth.guard';

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
  @SetMetadata('roles', ['guest', 'original-author', 'collaborator'])
  // Un Guard es una función que permite/previene el acceso a una ruta. Se ejecuta mucho antes que la ruta y el controlador. Fuente: https://docs.nestjs.com/guards
  @UseGuards(AuthGuard(), RolesGuard)
  segundaPrueba(@GetUser() user: User, @GetUser('email') userEmail: string) {
    return { token: user.token, user, userEmail };
  }
}
