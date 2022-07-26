import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@root/auth/jwt-auth.guard';
import { AddressBookDto } from '@root/dto/address-book.dto';
import { CreateUserDto, UpdateUserDto } from '@root/dto/user.dto';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { UserService } from '@root/services/user.service';
import { plainToClass } from 'class-transformer';
import { In } from 'typeorm';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('Bearer')
  @UseGuards(JwtAuthGuard)
  @Put('addressbook')
  async updateAddressBook(
    @Request() req,
    @Body() addressBookDto: AddressBookDto,
  ) {
    const savedPhoneNumbers = await PhoneNumberEntity.find({
      where: {
        phoneNumber: In(addressBookDto.addressBook.map((elem) => elem.phone)),
      },
    });

    const savedOnlyNumbers = savedPhoneNumbers.map((entity) => {
      return entity.phoneNumber;
    });
    const unsavedPhoneNumbers = addressBookDto.addressBook.filter((item) => {
      if (savedOnlyNumbers.includes(item.phone)) {
        return false;
      }
      return true;
    });

    const newSavedPhoneNumbers = await PhoneNumberEntity.save(
      unsavedPhoneNumbers.map((elem) =>
        plainToClass(PhoneNumberEntity, {
          phoneNumber: elem.phone,
        }),
      ),
    );

    return await this.userService.updateAddressBook(
      req.user,
      [...newSavedPhoneNumbers, ...savedPhoneNumbers],
      addressBookDto,
    );
  }

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

  @ApiParam({ name: 'id', description: '조회할 유저의 아이디', example: 1 })
  @Get(':id')
  async getOneUser(@Param('id', ParseIntPipe) userId: number) {
    return await this.userService.getOneUser(userId);
  }

  @ApiBody({ type: CreateUserDto })
  @Post()
  async saveUser(@Body() createUserDto: CreateUserDto) {
    const createdUser = await this.userService.getOneByEmailWithDeleted(
      createUserDto.email,
    );

    if (createdUser) {
      throw new BadRequestException('이미 생성된 유저입니다!');
    }
    const phoneNumber = createUserDto.phoneNumber;
    const savedPhoneNumber = await PhoneNumberEntity.save(phoneNumber);
    /* 테스트에서도 작성한 의문이지만,
      createUserDto를 재정의하는 과정에서 UserEntity 또는 CreateUserDto가 아닌
      일반 Object 자료형으로 변환된다.
      local 환경에서 테스트 한 결과 아직까지는 문제없이 동작하지만 추후에 어떤 문제가 발생할 지 알 수 없다.
      이를 class-transformer의 plainToClass(CreateUserDto | UserEntity, {...})
      와 같은 방식으로 형 변환을 해주어야 할 필요가 있는지, 그렇다면 왜 그런지에 대해 알고 싶다.
    */
    createUserDto = {
      ...createUserDto,
      phoneNumber: savedPhoneNumber,
    };
    return await this.userService.saveUser(createUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) userIdToDelete: number) {
    const deletedUser = await this.userService.getOneUser(userIdToDelete);

    if (!deletedUser) {
      throw new BadRequestException('없는 유저입니다!');
    }

    return await this.userService.deleteOneUser(userIdToDelete);
  }
}
