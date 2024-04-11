import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'keyStores' })
export class KeyStore {
    @Prop({ required: true, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: true })
    publicKey: string;

    @Prop()
    refreshTokenUsed: string[];
}

export const KeyStoreSchema = SchemaFactory.createForClass(KeyStore);
