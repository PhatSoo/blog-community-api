import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { KeyStore, KeyStoreSchema, User, UserSchema } from '../schemas';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { JwtStrategy } from './jwt.strategy';
import { RedisService } from 'src/redis/redis.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: KeyStore.name, schema: KeyStoreSchema },
        ]),
        JwtModule.register({}),
    ],
    controllers: [AuthController],
    providers: [AuthService, UserService, RedisService, JwtStrategy],
})
export class AuthModule {}
