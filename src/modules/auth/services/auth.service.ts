import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { LoginAuthDto } from '@/modules/auth/dto/login-auth.dto';
import { RegisterAuthDto } from '@/modules/auth/dto/register-auth.dto';
import { Repository } from 'typeorm';

import { User } from '@/modules/users/entities/user.entity';

import * as crypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from '../interfaces/jwt-payload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private logger: Logger;
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
    this.logger = new Logger();
  }

  async register(registerAuthDto: RegisterAuthDto) {
    const { password, ...registerDto } = registerAuthDto;

    const user = this.usersRepository.create({
      ...registerDto,
      password: crypt.hashSync(password, 12),
    });

    try {
      await this.usersRepository.save(user);

      delete user.password;
      delete user.user_id;

      return { ...user, token: this.getToken({ email: user.email }) };
    } catch (error) {
      this.handleException(error);
    }
  }

  async login(loginAuthDto: LoginAuthDto) {
    const { password, email } = loginAuthDto;
    let user: User;

    // operación a DB
    try {
      user = await this.usersRepository.findOne({
        where: { email },
        select: {
          email: true,
          password: true,
          user_id: false,
          nickname: false,
          profile_picture: false,
          description: false,
          creations: false,
        },
      });
    } catch (error) {
      this.handleException(error);
    }

    // Otras excepciones
    if (!user)
      throw new UnauthorizedException(
        'El email enviado es incorrecto. Verifique que el correo está bien.',
      );
    /* Si el usuario sí que existe entonces hay que verificar que la contraseña es igual */
    if (!crypt.compareSync(password, user.password))
      throw new UnauthorizedException('La contraseña no es correcta.');

    delete user.password;

    return { ...user, token: this.getToken({ email: user.email }) };
  }

  getToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload); // Ojo porque lo que recibe el método "sign" es un OBJETO, no el string de "email".
    return token;
  }

  handleException(error) {
    console.log(error);
    this.logger.error(error); // en cualquier tipo de error me interesa el logeo.

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }

    throw new InternalServerErrorException('Algo terrible ocurrió en el servidor.');
  }
}
