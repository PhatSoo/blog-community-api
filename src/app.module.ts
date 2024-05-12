import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongoConfig } from './configs/mongodb.config';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentModule } from './comment/comment.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisConfig } from './configs/redis.config';
import { RedisModule } from './redis/redis.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            useClass: MongoConfig,
        }),
        CacheModule.registerAsync({
            useClass: RedisConfig,
            isGlobal: true,
        }),
        UserModule,
        AuthModule,
        PostModule,
        CommentModule,
        RedisModule,
    ],
})
export class AppModule {}
