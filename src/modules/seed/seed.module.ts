import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { User } from '../users/entities/user.entity';
import { Creation } from '../creations/entities/creation.entity';
import { CreationsModule } from '../creations/creations.module';
import { CreationsService } from '../creations/creations.service';
import { CreationCollaboration } from '../creations/collaborations/entities/creation-collaboration.entity';

import { AuthService } from '../auth/services/auth.service';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { CollaborationsService } from '../creations/collaborations/collaborations.service';
import { CollaborationsModule } from '../creations/collaborations/collaborations.module';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { PartsService } from '../creations/parts/parts.service';
import { PartsModule } from '../creations/parts/parts.module';
import { Part } from '../creations/parts/entities/part.entity';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    PassportModule,
    TypeOrmModule.forFeature([User, Creation, CreationCollaboration, Part]),
    CreationsModule,
    CollaborationsModule,
    PartsModule,
  ],
  controllers: [SeedController],
  providers: [SeedService, CreationsService, AuthService, CollaborationsService, PartsService],
  exports: [],
})
export class SeedModule {}
