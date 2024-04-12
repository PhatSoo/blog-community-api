import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ConvertSlug } from '../utils';

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
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.pre('save', function (next) {
    this.slug = ConvertSlug(this.title);

    this.createdBy = new Types.ObjectId(this.createdBy);

    next();
});
