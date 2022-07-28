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
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuardWithApiBearerAuth } from '@root/decorators/api-bearer-with-jwt-guard.decorator';
import { UserId } from '@root/decorators/user-id.decorator';
import { AddressBookDto } from '@root/dto/address-book.dto';
import { CreateUserDto, UpdateUserDto } from '@root/dto/user.dto';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { UserService } from '@root/services/user.service';
import { plainToClass } from 'class-transformer';
import { In } from 'typeorm';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @JwtGuardWithApiBearerAuth()
  @Get('profile')
  @ApiOperation({summary: '유저의 프로필 조회'})
  getProfile(@Request() req) {
    return req.user;
  }

  @JwtGuardWithApiBearerAuth()
  @ApiOperation({ summary: '유저와 1다리 건너 아는 다른 사용자 조회' })
  @Get('acquaintance')
  async getAcquaintances(@UserId() userId: number) {
    return await this.userService.getAcquaintances(userId);
  }

  @JwtGuardWithApiBearerAuth()
  @Get('addressbook')
  @ApiOperation({ summary: '유저의 전화번호부 조회' })
  async getAddressBook(@UserId() userId: number) {
    return await this.userService.getAddressBook(userId);
  }

  @ApiBody({ type: AddressBookDto })
  @JwtGuardWithApiBearerAuth()
  @ApiOperation({ summary: '유저의 전화번호부 등록/갱신' })
  @Put('addressbook')
  async updateAddressBook(
    @UserId() userId: number,
    @Body() addressBookDto: AddressBookDto,
  ) {
    return await this.userService.updateAddressBook(userId, addressBookDto);
  }

  @ApiParam({ name: 'id', description: '수정할 유저의 아이디', example: 1 })
  @ApiBody({ type: UpdateUserDto })
  @ApiOperation({ summary: '유저의 정보 수정' })
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) userIdToUpdate: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.update(userIdToUpdate, updateUserDto);
    return true;
  }

  @ApiParam({ name: 'id', description: '조회할 유저의 아이디', example: 1 })
  @ApiOperation({ summary: '유저의 정보 조회' })
  @Get(':id')
  async getOneUser(@Param('id', ParseIntPipe) userId: number) {
    return await this.userService.getOneUser(userId);
  }

  @ApiParam({ name: 'id', description: '생성할 유저의 아이디', example: 1 })
  @ApiOperation({ summary: '유저의 정보 생성' })
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
    
    createUserDto = {
      ...createUserDto,
      phoneNumber: savedPhoneNumber,
    };
    return await this.userService.saveUser(createUserDto);
  }

  @ApiParam({ name: 'id', description: '삭제할 유저의 아이디', example: 1 })
  @ApiOperation({ summary: '유저의 정보 삭제' })
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) userIdToDelete: number) {
    const deletedUser = await this.userService.getOneUser(userIdToDelete);

    if (!deletedUser) {
      throw new BadRequestException('없는 유저입니다!');
    }

    return await this.userService.deleteOneUser(userIdToDelete);
  }
}
