import {
    BadRequestException,
    HttpStatus,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { LoginDTO, RegisterDTO } from 'src/dtos';
import * as bcrypt from 'bcrypt';
import { generateKeyPairSync } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Token, UserRequest } from 'src/types';
import { HEADERS } from 'src/constants';
import { UserService } from 'src/user/user.service';
import { ResponseType } from 'src/types';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private redisService: RedisService,
    ) {}

    async login(loginDTO: LoginDTO): Promise<ResponseType> {
        const { email, password } = loginDTO;
        const foundUser = await this.userService.findByEmail(email);
        if (!foundUser) {
            this.logger.error('Login failed');
            throw new UnauthorizedException('Login failed!');
        }
        if (!(await bcrypt.compare(password, foundUser.password))) {
            this.logger.error('Login failed');
            throw new UnauthorizedException('Login failed!');
        }
        const { publicKey, privateKey } = this.generateKeyPair();
        const { id, displayName, isAdmin } = foundUser;

        const token = this.createTokenPair(
            { id, displayName, isAdmin },
            privateKey,
        );
        // store login session of user
        await this.redisService.storeKey(id, publicKey);

        return {
            statusCode: HttpStatus.OK,
            message: 'Login successful!',
            data: token,
        };
    }

    async register(registerDTO: RegisterDTO): Promise<ResponseType> {
        const { email } = registerDTO;

        const foundUser = await this.userService.findByEmail(email);

        if (foundUser) {
            this.logger.error('This email has already used!');
            throw new BadRequestException('This email has already used!');
        }

        registerDTO.password = await bcrypt.hash(registerDTO.password, 10);

        const newUser = await this.userService.createUser(registerDTO);

        if (!newUser) {
            this.logger.error('Create new user failed!');
            throw new BadRequestException('Something went wrong!');
        }

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Register an account successfull!',
        };
    }

    async refresh(req: UserRequest): Promise<ResponseType> {
        const rf_token = req.headers[HEADERS.RF_TOKEN];

        if (!rf_token) {
            this.logger.error('Have no rf-token');
            throw new UnauthorizedException('Re-login!');
        }

        const decode: Token = this.jwtService.decode(rf_token);

        const { id, displayName, isAdmin } = decode;

        const foundKeyStore: any = await this.redisService.getKey(id);

        if (!foundKeyStore) {
            this.logger.error('Keystore not found!');
            throw new UnauthorizedException('Re-login!');
        }

        // check if user use an old refreshToken => true => disconnect user
        if (foundKeyStore.refreshTokensUsed.includes(rf_token)) {
            await this.redisService.getKey(id);

            this.logger.error('Using rf-token in black list');
            throw new UnauthorizedException('Something went wrong! Re-login.');
        }

        try {
            this.jwtService.verify(rf_token, {
                publicKey: foundKeyStore.publicKey,
            });
        } catch (error: any) {
            this.logger.error(error.message);
            throw new UnauthorizedException(error.message);
        }

        const { publicKey, privateKey } = this.generateKeyPair();

        const token = this.createTokenPair(
            { id, displayName, isAdmin },
            privateKey,
        );

        await this.redisService.storeKey(id, publicKey, rf_token);

        return {
            statusCode: HttpStatus.OK,
            message: 'Refresh token accepted!',
            data: token,
        };
    }

    async logout(req: UserRequest): Promise<ResponseType> {
        const { id } = req.user;

        await this.redisService.deleteKey(id);

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

        const foundKeyStore: any = await this.redisService.getKey(id);

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
