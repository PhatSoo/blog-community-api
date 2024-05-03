import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { convertSlug, removeSpace } from '../utils';

@Schema({ timestamps: true })
export class Post {
    @Prop({ required: true, unique: true })
    title: string;

    @Prop()
    slug: string;

    @Prop({ required: true })
    content: string;

    @Prop({ default: true })
    status: boolean;

    @Prop({ required: true, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop()
    description: string;

    @Prop({ default: 0 })
    views: number;

    @Prop({ default: 0 })
    interactives: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.pre('save', function (next) {
    this.title = removeSpace(this.title);
    this.slug = convertSlug(this.title);

    this.createdBy = new Types.ObjectId(this.createdBy);

    next();
});
