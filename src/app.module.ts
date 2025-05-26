import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EnvConfiguration } from './modules/config/env.config';

import { UsersModule } from '@/modules/users/users.module';
import { User } from './modules/users/entities/user.entity';

import { CommonModule } from './modules/common/common.module';
import { CreationsModule } from './modules/creations/creations.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeedModule } from './modules/seed/seed.module';
import { PartsModule } from './modules/parts/parts.module';

@Module({
  imports: [
    // configuraciones del proyecto (.env, database, etc.)
    ConfigModule.forRoot({ load: [EnvConfiguration] }), // Me resulta super llamativo que, si no ejecutas esta función y haces un console.log de process.env te sale todas las variables de entorno de tu máquina pero no las variables de entorno del .env de tu proyecto!
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true, // ahora que tengo autoload no hace falta que declare mis entidades en "entities", solo necesito usarlas en un módulo y se autodetectan solas.
    }),
    // features de la aplicación
    UsersModule,
    CommonModule,
    CreationsModule,
    AuthModule,
    SeedModule,
    PartsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {}
}
