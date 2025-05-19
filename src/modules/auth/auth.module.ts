import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from '@/modules/auth/services/auth.service';
import { AuthController } from './controllers/auth.controller';

import { User } from '../users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JWTStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    /* Uso 'registerAsync' porque podría pasar en el futuro de que necesito servicios/apis externos a los que hay que llamar y obtener data. Esto es lo más escalable para el futuro.
    ConfigModule está aquí porque en el futuro puedo añadir validaciones a ese módulo para que pete si no hay determinadas variables definidas. Nos tenemos que conformar con esto de momento.*/
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        if (!configService.get('secret'))
          throw new Error("La variable de entorno 'SECRET' no ha sido definida.");

        return {
          secret: configService.get('secret'),
          signOptions: {
            expiresIn: '7d',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JWTStrategy],
  exports: [JWTStrategy, JwtModule, PassportModule],
})
export class AuthModule {}
