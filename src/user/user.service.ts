import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDTO } from 'src/dtos';
import { User } from 'src/schemas';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async findById(id: string) {
        return await this.userModel.findById(id).exec();
    }

    async findByEmail(email: string) {
        return await this.userModel
            .findOne({ email })
            .select('+password')
            .exec();
    }

    async createUser(registerDTO: RegisterDTO) {
        return await this.userModel.create(registerDTO);
    }
}
