import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDTO, RegisterDTO } from 'src/dtos';
import { User } from 'src/schemas';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async login(loginDTO: LoginDTO) {
    const { email, password } = loginDTO;

    const foundUser = await this.userModel.findOne({ email }).exec();

    if (!foundUser) {
      throw new BadRequestException('Login failed!');
    }

    if (!bcrypt.compare(password, foundUser.password)) {
      throw new BadRequestException('Login failed!');
    }

    return foundUser;
  }

  async register(registerDTO: RegisterDTO) {
    const { email } = registerDTO;

    const foundUser = await this.userModel.findOne({ email }).exec();

    if (foundUser) throw new BadRequestException('This email already in use!');

    const newUser = await this.userModel.create(registerDTO);

    if (!newUser) throw new BadRequestException('Something went wrong!');

    return newUser;
  }
}
