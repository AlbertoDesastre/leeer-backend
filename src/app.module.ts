import { Module } from '@nestjs/common';

import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    // application's features
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
