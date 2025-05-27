import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreationsModule } from '../creations.module';
import { AuthModule } from '@/modules/auth/auth.module';

import { Part } from '../parts/entities/part.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Creation } from '../entities/creation.entity';
import { CreationCollaboration } from './entities/creation-collaboration.entity';
import { CollaborationsController } from './collaborations.controller';
import { CollaborationsService } from './collaborations.service';
import { CreationsService } from '../creations.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Creation, CreationCollaboration, Part]),
    AuthModule,
    CreationsModule,
  ],
  controllers: [CollaborationsController],
  providers: [CollaborationsService, CreationsService],
  exports: [],
})
export class CollaborationsModule {}
