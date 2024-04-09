import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from '../dtos';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { AuthGuard } from './auth.guard';

@Controller()
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

  @UseGuards(AuthGuard)
  @Get('/refresh')
  refresh(@Req() req: Request) {
    return this.authService.refresh(req);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  logout(@Req() req: Request) {
    return this.authService.logout(req);
  }
}
