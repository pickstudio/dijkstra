import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserEntity } from '@root/entities/user.entity';
import { UserService } from '@root/services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUser() {
    return this.userService.getAll();
  }

  @Post()
  async saveUser(@Body() user: UserEntity) {
    return this.userService.saveUser(user)
  }
}
