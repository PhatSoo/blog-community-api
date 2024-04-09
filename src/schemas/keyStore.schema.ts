import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import * as MongooseSchema from 'mongoose';

@Schema({ timestamps: true, collection: 'keyStores' })
export class KeyStore {
  @Prop({ required: true, ref: User.name })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  publicKey: string;

  @Prop()
  refreshTokenUsed: string[];
}

export const KeyStoreSchema = SchemaFactory.createForClass(KeyStore);
