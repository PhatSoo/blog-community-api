import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { KeyStore } from 'src/schemas';

@Injectable()
export class KeyStoreService {
  constructor(
    @InjectModel(KeyStore.name) private keyStoreModel: Model<KeyStore>,
  ) {}

  async findByUserID(id: string) {
    return await this.keyStoreModel
      .findOne({ userId: new Types.ObjectId(id) })
      .exec();
  }

  async findOneAndUpdate({ userId, publicKey }, options = {}) {
    return await this.keyStoreModel.findOneAndUpdate(
      {
        userId,
      },
      { publicKey, ...options },
      {
        upsert: true,
        new: true,
      },
    );
  }

  async deleteByUserId(userId: string) {
    return await this.keyStoreModel.deleteOne({
      userId: new Types.ObjectId(userId),
    });
  }
}
