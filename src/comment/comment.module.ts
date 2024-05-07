import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema, Post, PostSchema } from '../schemas';
import { PostService } from 'src/post/post.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Comment.name, schema: CommentSchema },
            { name: Post.name, schema: PostSchema },
        ]),
    ],
    controllers: [CommentController],
    providers: [CommentService, PostService],
})
export class CommentModule {}
