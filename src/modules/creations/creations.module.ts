import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreationsService } from '@/modules/creations/services/creations.service';
import { CreationsController } from '@/modules/creations/controllers/creations.controller';
import { Creation } from './entities/creation.entity';

import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { CreationCollaboration } from './entities/creation-collaboration.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Creation, CreationCollaboration]),
    AuthModule,
  ],
  controllers: [CreationsController],
  providers: [CreationsService],
  exports: [],
})
export class CreationsModule {}
