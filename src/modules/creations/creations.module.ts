import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreationsService } from '@/modules/creations/services/creations.service';
import { CreationsController } from '@/modules/creations/controllers/creations.controller';
import { Creation } from './entities/creation.entity';

import { User } from '../users/entities/user.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Creation, User])],
  controllers: [CreationsController],
  providers: [CreationsService],
  exports: [],
})
export class CreationsModule {}
