import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

import { Creation } from '../creations/entities/creation.entity';
import { CreationCollaboration } from '../creations/collaborations/entities/creation-collaboration.entity';
import { Part } from '../creations/parts/entities/part.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Creation, CreationCollaboration, Part])], // El método .forFeature define qué repositorios están registrados en este scope | Ahora el UserRepository y CreationRepository (de otro módulo) es accesible en este scope
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersModule],
})
export class UsersModule {}
