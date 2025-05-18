import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';

import { Creation } from '../creations/entities/creation.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Creation])], // El método .forFeature define qué repositorios están registrados en este scope | Ahora el UserRepository y CreationRepository (de otro módulo) es accesible en este scope
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersModule],
})
export class UsersModule {}
