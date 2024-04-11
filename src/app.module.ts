import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongoConfig } from './configs/mongodb.config';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            useClass: MongoConfig,
        }),
        UserModule,
        AuthModule,
        PostModule,
    ],
})
export class AppModule {}
