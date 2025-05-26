import { Module } from '@nestjs/common';
import { PartsService } from './services/parts.service';
import { PartsController } from './controllers/parts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { Creation } from '../creations/entities/creation.entity';
import { Part } from './entities/part.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Creation])],
  controllers: [PartsController],
  providers: [PartsService],
})
export class PartsModule {}
