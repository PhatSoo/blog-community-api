import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/schemas';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  list(): Promise<User[]> {
    return this.userService.test();
  }
}
