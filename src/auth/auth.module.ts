import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { KeyStore, KeyStoreSchema, User, UserSchema } from 'src/schemas';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { KeyStoreService } from 'src/keyStore/keyStore.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: KeyStore.name, schema: KeyStoreSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, KeyStoreService],
})
export class AuthModule {}
