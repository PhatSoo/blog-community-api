import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDTO, RegisterDTO } from 'src/dtos';
import * as bcrypt from 'bcrypt';
import { generateKeyPairSync } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Token } from 'src/types';
import { Request } from 'express';
import { HEADERS } from 'src/constants';
import { UserService } from 'src/user/user.service';
import { KeyStoreService } from 'src/keyStore/keyStore.service';
import { ResponseType } from 'src/types';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private keyStoreService: KeyStoreService,
  ) {}

  async login(loginDTO: LoginDTO): Promise<ResponseType> {
    const { email, password } = loginDTO;
    const foundUser = await this.userService.findByEmail(email);

    if (!foundUser) {
      throw new UnauthorizedException('Login failed!');
    }

    if (!bcrypt.compare(password, foundUser.password)) {
      throw new UnauthorizedException('Login failed!');
    }

    const { publicKey, privateKey } = this.generateKeyPair();

    const { id, displayName, isAdmin } = foundUser;

    const token = this.createTokenPair(
      { userId: id, displayName, isAdmin },
      privateKey,
    );

    // store login session of user
    const keyStore = await this.keyStoreService.findOneAndUpdate({
      userId: new Types.ObjectId(id),
      publicKey,
    });

    if (!keyStore)
      throw new BadRequestException('Something went wrong! Re-login.');

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful!',
      data: token,
    };
  }

  async register(registerDTO: RegisterDTO): Promise<ResponseType> {
    const { email } = registerDTO;

    const foundUser = await this.userService.findByEmail(email);

    if (foundUser)
      throw new BadRequestException('This email has already used!');

    const newUser = await this.userService.createUser(registerDTO);

    if (!newUser) throw new BadRequestException('Something went wrong!');

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Register an account successfull!',
    };
  }

  async refresh(req: Request): Promise<ResponseType> {
    const rf_token = req.headers[HEADERS.RF_TOKEN].toString();

    if (!rf_token) throw new UnauthorizedException('Re-login!');

    const { userId, displayName, isAdmin } = this.jwtService.decode(rf_token);

    const foundKeyStore = await this.keyStoreService.findByUserID(userId);

    if (!foundKeyStore) throw new UnauthorizedException('Re-login!');

    // check if user use an old refreshToken => true => disconnect user
    if (foundKeyStore.refreshTokenUsed.includes(rf_token)) {
      await this.keyStoreService.deleteByUserId(userId);

      throw new UnauthorizedException('Something went wrong! Re-login.');
    }

    try {
      this.jwtService.verify(rf_token, {
        publicKey: foundKeyStore.publicKey,
      });
    } catch (error) {
      throw new UnauthorizedException('Re-login');
    }

    const { publicKey, privateKey } = this.generateKeyPair();

    const token = this.createTokenPair(
      { userId, displayName, isAdmin },
      privateKey,
    );

    const keyStore = await this.keyStoreService.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        publicKey,
      },
      { $push: { refreshTokenUsed: rf_token } },
    );

    if (!keyStore)
      throw new BadRequestException('Something went wrong! Re-login.');

    return {
      statusCode: HttpStatus.OK,
      message: 'Refresh token accepted!',
      data: token,
    };
  }

  async logout(req: Request): Promise<ResponseType> {
    const ac_token = req.headers.authorization.split(' ')[1];

    const verified = await this.verify(ac_token);

    if (!verified) throw new UnauthorizedException();

    const deleteKeyStore = await this.keyStoreService.deleteByUserId(
      verified.userId,
    );

    if (!deleteKeyStore)
      throw new BadRequestException('Something went wrong! Try again later.');

    return {
      statusCode: HttpStatus.OK,
      message: 'Logout success!',
    };
  }

  async verify(token: string) {
    const { userId } = this.jwtService.decode(token);

    const foundKeyStore = await this.keyStoreService.findByUserID(userId);

    if (!foundKeyStore) throw new UnauthorizedException('Re-login');

    try {
      return this.jwtService.verify(token, {
        publicKey: foundKeyStore.publicKey,
      });
    } catch (error) {
      return false;
    }
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
