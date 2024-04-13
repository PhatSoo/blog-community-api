import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from '../schemas';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
        JwtModule.register({}),
    ],
    controllers: [PostController],
    providers: [PostService],
})
export class PostModule {}
