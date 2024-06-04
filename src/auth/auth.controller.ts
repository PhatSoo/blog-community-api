import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from '../dtos';
import { AuthService } from './auth.service';
import { UserRequest } from '../types';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/login')
    login(@Body() loginDTO: LoginDTO) {
        return this.authService.login(loginDTO);
    }

    @Post('/register')
    register(@Body() registerDTO: RegisterDTO) {
        return this.authService.register(registerDTO);
    }

    @Get('/refresh')
    refresh(@Req() req: UserRequest) {
        return this.authService.refresh(req);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Req() req: UserRequest) {
        return this.authService.logout(req);
    }

    @Get('/me')
    @UseGuards(JwtAuthGuard)
    me(@Req() req: UserRequest) {
        return this.authService.me(req);
    }
}
