import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
    KeyStore,
    KeyStoreSchema,
    Post,
    PostSchema,
    User,
    UserSchema,
} from '../schemas';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { KeyStoreService } from 'src/keyStore/keyStore.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Post.name, schema: PostSchema },
            { name: User.name, schema: UserSchema },
            { name: KeyStore.name, schema: KeyStoreSchema },
        ]),
        JwtModule.register({}),
    ],
    controllers: [PostController],
    providers: [
        PostService,
        AuthGuard,
        AuthService,
        UserService,
        KeyStoreService,
    ],
})
export class PostModule {}
