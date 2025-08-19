import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Controller, Post, Body } from '@nestjs/common';

import { AuthService } from '@/modules/auth/auth.service';
import { RegisterAuthDto } from '@/modules/auth/dto/register-auth.dto';
import { LoginAuthDto } from '@/modules/auth/dto/login-auth.dto';
import { AuthResponseDto } from '@/modules/auth/dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: RegisterAuthDto })
  @ApiResponse({ status: 201, type: AuthResponseDto, description: 'Usuario registrado correctamente.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiBody({ type: LoginAuthDto })
  @ApiResponse({ status: 200, type: AuthResponseDto, description: 'Login exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }
}
