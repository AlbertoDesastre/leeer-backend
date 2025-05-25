import { Controller, Post, Body } from '@nestjs/common';

import { AuthService } from '@/modules/auth/services/auth.service';
import { RegisterAuthDto } from '@/modules/auth/dto/register-auth.dto';
import { LoginAuthDto } from '@/modules/auth/dto/login-auth.dto';

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
}
