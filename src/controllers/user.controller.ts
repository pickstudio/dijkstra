import { Controller, Get } from '@nestjs/common';
import { UserService } from '@root/services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUser() {
    return this.userService.getAll();
  }
}
