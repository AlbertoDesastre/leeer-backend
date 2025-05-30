import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreationsService } from '@/modules/creations/creations.service';
import { CreationsController } from '@/modules/creations/creations.controller';
import { Creation } from './entities/creation.entity';

import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

import { CreationCollaboration } from './collaborations/entities/creation-collaboration.entity';
import { Part } from './parts/entities/part.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Creation, CreationCollaboration, Part]),
    AuthModule,
  ],
  controllers: [CreationsController],
  providers: [CreationsService],
  exports: [],
})
export class CreationsModule {}
