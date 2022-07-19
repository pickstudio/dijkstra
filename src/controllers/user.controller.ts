import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from '@root/dto/user.dto';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { UserService } from '@root/services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiParam({ name: 'id', description: '수정할 유저의 아이디', example: 1 })
  @ApiBody({ type: UpdateUserDto })
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) userIdToUpdate: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.update(userIdToUpdate, updateUserDto);
    return true;
  }

  @Get()
  async getUser() {
    // if (true) {
    //   throw new BadRequestException({
    //     message: '나는 이유없이 에러를 던질거야!',
    //   });
    //   // return { message, statusCode: 400, timestamp: new Date(), path: '/user' };
    // }

    return await this.userService.getAll();
  }

  @Get(':id')
  async getOneUser(@Param('id', ParseIntPipe) userId: number) {
    return await this.userService.getOneUser(userId);
  }

  @Post()
  async saveUser(@Body() createUserDto: CreateUserDto) {
    const createdUser = await this.userService.getOneByEmailWithDeleted(
      createUserDto.email,
    );

    if (createdUser) {
      throw new BadRequestException('이미 생성된 유저입니다!');
    }
    const phoneNumber: PhoneNumberEntity = new PhoneNumberEntity();
    phoneNumber.phoneNumber = createUserDto.phoneNumber.toString();
    const savedPhoneNumber = await PhoneNumberEntity.save(phoneNumber);
    createUserDto = {
      ...createUserDto,
      phoneNumber: savedPhoneNumber,
    };
    return await this.userService.saveUser(createUserDto);
  }
}
