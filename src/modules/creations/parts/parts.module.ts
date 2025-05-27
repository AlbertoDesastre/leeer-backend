import { Module } from '@nestjs/common';
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { User } from '@/modules/users/entities/user.entity';
import { CreationCollaboration } from '../collaborations/entities/creation-collaboration.entity';
import { Creation } from '../entities/creation.entity';
import { Part } from './entities/part.entity';

import { AuthModule } from '@/modules/auth/auth.module';
import { AuthService } from '@/modules/auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CreationsService } from '../creations.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Creation, CreationCollaboration, Part]), AuthModule],
  controllers: [PartsController],
  providers: [ConfigService, AuthService, JwtService, PartsService, CreationsService],
})
export class PartsModule {}
