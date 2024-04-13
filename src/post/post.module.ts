import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema, Post, PostSchema } from '../schemas';
import { PostGuard } from './post.guard';
import { CommentService } from 'src/comment/comment.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Post.name, schema: PostSchema },
            { name: Comment.name, schema: CommentSchema },
        ]),
    ],
    controllers: [PostController],
    providers: [PostService, PostGuard, CommentService],
})
export class PostModule {}
