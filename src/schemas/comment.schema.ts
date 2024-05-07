import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
    @Prop({ required: true, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: true, ref: 'Post' })
    postId: Types.ObjectId;

    @Prop({ ref: 'Comment' })
    parentId: Types.ObjectId;

    @Prop({ required: true })
    message: string;

    @Prop({ default: true })
    status: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
