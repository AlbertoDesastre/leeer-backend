import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreationsService } from '@/modules/creations/services/creations.service';
import { CreationsController } from '@/modules/creations/controllers/creations.controller';
import { Creation } from './entities/creation.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Creation])],
  controllers: [CreationsController],
  providers: [CreationsService],
})
export class CreationsModule {}
