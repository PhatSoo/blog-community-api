import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Token } from '../types';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKeyProvider: async (
                request: Request,
                rawJwtToken: string,
                done: any,
            ) => {
                const key = await authService.getPublicKey(rawJwtToken);

                done(null, key);
            },
        });
    }

    async validate(payload: Token) {
        const { userId, displayName, isAdmin } = payload;
        return {
            userId,
            displayName,
            isAdmin,
        };
    }
}
