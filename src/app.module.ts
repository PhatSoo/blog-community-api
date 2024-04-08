import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongoDBModule } from './configs/mongodb.config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [MongoDBModule, UserModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
