import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongoDBModule } from './configs/mongodb.config';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongoDBModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
