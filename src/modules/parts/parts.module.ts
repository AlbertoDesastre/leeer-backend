import { Module } from '@nestjs/common';
import { PartsService } from './services/parts.service';
import { PartsController } from './controllers/parts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreationCollaboration } from '../creations/entities/creation-collaboration.entity';
import { User } from '../users/entities/user.entity';
import { Creation } from '../creations/entities/creation.entity';

import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User, Creation, CreationCollaboration]), AuthModule],
  controllers: [PartsController],
  providers: [AuthService, JwtService, PartsService],
})
export class PartsModule {}
