import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '@/modules/users/users.module';
import { User } from './modules/users/entities/user.entity';
import { EnvConfiguration } from './modules/config/env.config';

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
      entities: [User], // informo a TypeORM de esta entidad
      database: process.env.DB_NAME,
    }),
    // features de la aplicación
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {}
}
