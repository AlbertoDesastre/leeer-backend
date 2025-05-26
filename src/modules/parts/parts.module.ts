import { Module } from '@nestjs/common';
import { PartsService } from './services/parts.service';
import { PartsController } from './controllers/parts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { CreationCollaboration } from '../creations/entities/creation-collaboration.entity';
import { User } from '../users/entities/user.entity';
import { Creation } from '../creations/entities/creation.entity';
import { Part } from './entities/part.entity';

import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CreationsService } from '../creations/services/creations.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Creation, CreationCollaboration, Part]), AuthModule],
  controllers: [PartsController],
  providers: [ConfigService, AuthService, JwtService, PartsService, CreationsService],
})
export class PartsModule {}
