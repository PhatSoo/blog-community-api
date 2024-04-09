import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RegisterDTO } from 'src/dtos';
import { KeyStore, User } from 'src/schemas';
import * as bcrypt from 'bcrypt';
import { generateKeyPairSync } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Token } from 'src/types';
import { Request, response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(KeyStore.name) private keyStoreModel: Model<KeyStore>,
    private jwtService: JwtService,
  ) {}

  async login({ email, password }) {
    const foundUser = await this.userModel.findOne({ email }).exec();

    if (!foundUser) {
      throw new UnauthorizedException('Login failed!');
    }

    if (!bcrypt.compare(password, foundUser.password)) {
      throw new UnauthorizedException('Login failed!');
    }

    const { publicKey, privateKey } = this.generateKeyPair();

    const { id, displayName } = foundUser;
    const token = this.createTokenPair({ userId: id, displayName }, privateKey);

    // store login session of user
    const keyStore = await this.keyStoreModel.findOneAndUpdate(
      {
        userId: foundUser._id,
      },
      { publicKey },
      {
        upsert: true,
        new: true,
      },
    );

    if (!keyStore)
      throw new BadRequestException('Something went wrong! Re-login.');

    return token;
  }

  async register(registerDTO: RegisterDTO) {
    const { email } = registerDTO;

    const foundUser = await this.userModel.findOne({ email }).exec();

    if (foundUser)
      throw new BadRequestException('This email has already used!');

    const newUser = await this.userModel.create(registerDTO);

    if (!newUser) throw new BadRequestException('Something went wrong!');

    return newUser;
  }

  async refresh(req: Request) {
    const rf_token = req.headers['rf-token'].toString();

    if (!rf_token) throw new UnauthorizedException('Re-login!');

    const { userId, displayName } = this.jwtService.decode(rf_token);

    const foundKeyStore = await this.keyStoreModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!foundKeyStore) throw new UnauthorizedException('Re-login!');

    // check if user use an old refreshToken => true => disconnect user
    if (foundKeyStore.refreshTokenUsed.includes(rf_token)) {
      return this.logout(req);
    }

    const verify = this.jwtService.verify(rf_token, foundKeyStore);

    if (!verify) {
      throw new UnauthorizedException('Re-login!');
    }

    const { publicKey, privateKey } = this.generateKeyPair();

    const token = this.createTokenPair({ userId, displayName }, privateKey);

    const keyStore = await this.keyStoreModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
      },
      { publicKey, $push: { refreshTokenUsed: rf_token } },
      {
        upsert: true,
        new: true,
      },
    );

    if (!keyStore)
      throw new BadRequestException('Something went wrong! Re-login.');

    return token;
  }

  async logout(req: Request) {
    const ac_token = req.headers.authorization?.split(' ')[1];

    const { userId } = this.jwtService.decode(ac_token);

    if (!userId)
      throw new BadRequestException('Something went wrong! Try again later.');

    const deleteKeyStore = await this.keyStoreModel.deleteOne({
      userId: new Types.ObjectId(userId),
    });

    if (!deleteKeyStore)
      throw new BadRequestException('Something went wrong! Try again later.');

    return {
      statusCode: 200,
      message: 'Logout success!',
    };
  }

  generateKeyPair() {
    return generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    });
  }

  createTokenPair(payload: Token, privateKey: string) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      privateKey,
      algorithm: 'PS256',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
      privateKey,
      algorithm: 'PS256',
    });

    return { accessToken, refreshToken };
  }
}
