import { User } from '@/modules/users/entities/user.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { JwtPayload } from '../interfaces/jwt-payload';

/* Así como está la clase extendida de PassportStrategy con la Strategy de passport ya me verifica:
1) la expiración del token
2) verificar el secreto del token
3) si el token es válido

Ahora, de aquí se pueden aumentar las validaciones con métodos custom por mí.*/
@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      secretOrKey: configService.get('secret'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOneBy({ email: payload.email });

    if (!user) throw new UnauthorizedException('El token no es válido.');

    delete payload.email;

    return user;
  }
}
