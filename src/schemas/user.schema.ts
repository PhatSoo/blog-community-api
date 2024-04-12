import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    email: string;

    @Prop({ required: true, select: false })
    password: string;

    @Prop({ required: true })
    displayName: string;

    @Prop({ default: false })
    isAdmin: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
