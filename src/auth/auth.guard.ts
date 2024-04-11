import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { HEADERS } from '../constants';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        let token = '';

        if (req.headers[HEADERS.RF_TOKEN]) {
            // get refresh token in header
            token = req.headers[HEADERS.RF_TOKEN];
        } else {
            token = req.headers[HEADERS.AUTHORIZATION].split(' ')[1];
        }

        const verify = await this.authService.verify(token);

        const { userId, displayName, isAdmin } = verify;

        req.userId = userId;
        req.displayName = displayName;
        req.isAdmin = isAdmin;

        return true;
    }
}
