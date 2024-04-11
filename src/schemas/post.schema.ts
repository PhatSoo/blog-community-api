import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post {
    @Prop({ required: true })
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
    this.slug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // thay khoảng trắng bằng '-'.
        .replace(/^-+|-+$/g, ''); // bỏ dấu gạch ngang ở đầu và cuối (nếu có).
    next();
});
