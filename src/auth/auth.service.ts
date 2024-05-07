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
import { Token, UserRequest } from 'src/types';
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
        if (!(await bcrypt.compare(password, foundUser.password))) {
            throw new UnauthorizedException('Login failed!');
        }
        const { publicKey, privateKey } = this.generateKeyPair();
        const { id, displayName, isAdmin } = foundUser;

        const token = this.createTokenPair(
            { id, displayName, isAdmin },
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

        registerDTO.password = await bcrypt.hash(registerDTO.password, 10);

        const newUser = await this.userService.createUser(registerDTO);

        if (!newUser) throw new BadRequestException('Something went wrong!');

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Register an account successfull!',
        };
    }

    async refresh(req: UserRequest): Promise<ResponseType> {
        const rf_token = req.headers[HEADERS.RF_TOKEN];

        if (!rf_token) throw new UnauthorizedException('Re-login!');

        const decode: Token = this.jwtService.decode(rf_token);

        const { id, displayName, isAdmin } = decode;

        const foundKeyStore = await this.keyStoreService.findByUserID(id);

        if (!foundKeyStore) throw new UnauthorizedException('Re-login!');

        // check if user use an old refreshToken => true => disconnect user
        if (foundKeyStore.refreshTokenUsed.includes(rf_token)) {
            await this.keyStoreService.deleteByUserId(id);

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
            { id, displayName, isAdmin },
            privateKey,
        );

        const keyStore = await this.keyStoreService.findOneAndUpdate(
            {
                userId: new Types.ObjectId(id),
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

    async logout(req: UserRequest): Promise<ResponseType> {
        const { id } = req.user;

        const deleteKeyStore = await this.keyStoreService.deleteByUserId(id);

        if (!deleteKeyStore)
            throw new BadRequestException(
                'Something went wrong! Try again later.',
            );

        return {
            statusCode: HttpStatus.OK,
            message: 'Logout success!',
        };
    }

    async me(req: UserRequest): Promise<ResponseType> {
        return {
            statusCode: HttpStatus.OK,
            message: 'Get User Info success!',
            data: req.user,
        };
    }

    async getPublicKey(token: string) {
        const { id } = this.jwtService.decode(token);

        const foundKeyStore = await this.keyStoreService.findByUserID(id);

        if (!foundKeyStore) return false;

        return foundKeyStore.publicKey;
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
