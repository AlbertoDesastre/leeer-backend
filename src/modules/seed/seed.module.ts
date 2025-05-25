import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { SeedController } from './users/controllers/seed.controller';
import { SeedService } from './users/services/seed.service';

import { User } from '../users/entities/user.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User])],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedModule],
})
export class SeedModule {}
