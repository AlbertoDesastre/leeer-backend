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

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    PassportModule,
    TypeOrmModule.forFeature([User, Creation, CreationCollaboration]),
    CreationsModule,
    CollaborationsModule,
  ],
  controllers: [SeedController],
  providers: [SeedService, CreationsService, AuthService, CollaborationsService],
  exports: [],
})
export class SeedModule {}
