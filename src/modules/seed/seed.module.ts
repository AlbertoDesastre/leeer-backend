import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { SeedController } from './controllers/seed.controller';
import { SeedService } from './services/seed.service';

import { User } from '../users/entities/user.entity';
import { Creation } from '../creations/entities/creation.entity';
import { CreationsModule } from '../creations/creations.module';
import { CreationsService } from '../creations/services/creations.service';
import { CreationCollaboration } from '../creations/entities/creation-collaboration.entity';
import { UsersService } from '../users/services/users.service';
import { AuthService } from '../auth/services/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    PassportModule,
    TypeOrmModule.forFeature([User, Creation, CreationCollaboration]),
    CreationsModule,
  ],
  controllers: [SeedController],
  providers: [SeedService, CreationsService, AuthService],
  exports: [],
})
export class SeedModule {}
