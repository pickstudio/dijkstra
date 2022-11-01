import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtGuardWithApiBearerAuth } from '@root/decorators/api-bearer-with-jwt-guard.decorator';
import { PageParams } from '@root/decorators/page-params.decorator';
import { UserId } from '@root/decorators/user-id.decorator';
import { AddressBookDto } from '@root/dto/address-book.dto';
import { SearchPaginationDto } from '@root/dto/common/search-pagination.dto';
import { CreateUserDto } from '@root/dto/create-user.dto';
import { UpdateUserDto } from '@root/dto/update-user.dto';
import { PhoneNumberService } from '@root/services/phone-number.service';
import { UserService } from '@root/services/user.service';
import { ERROR_MESSAGE } from '@root/utils/error-message';

@JwtGuardWithApiBearerAuth()
@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService, private readonly phoneNumberService: PhoneNumberService) {}

    @Get('profile')
    @ApiOperation({ summary: '유저의 프로필 조회' })
    async getProfile(@UserId() userId: number) {
        return await this.userService.getProfile(userId);
    }

    @ApiOperation({ summary: '유저와 1다리 건너 아는 다른 사용자 조회' })
    @Get('acquaintance')
    async getAcquaintances(@UserId() userId: number, @PageParams() searchPaginationDto: SearchPaginationDto) {
        return await this.userService.getAcquaintances(userId, searchPaginationDto);
    }

    @Get('address-book')
    @ApiOperation({ summary: '유저의 전화번호부 조회' })
    async getAddressBook(@UserId() userId: number) {
        return await this.userService.getAddressBook(userId);
    }

    @ApiOperation({ summary: '유저의 전화번호부 등록/갱신' })
    @Put('address-book')
    async updateAddressBook(@UserId() userId: number, @Body() { addressBooks }: AddressBookDto) {
        const phoneNumbers = addressBooks.map((el) => el.phoneNumber);
        const savedPhoneNumber = await this.phoneNumberService.saveOrIgnore(phoneNumbers);
        await this.phoneNumberService.register(userId, savedPhoneNumber, addressBooks);
        return true;
    }

    @ApiParam({ name: 'id', description: '조회할 유저의 아이디', example: 1 })
    @ApiOperation({ summary: '유저의 정보 조회' })
    @Get(':id')
    async getOneUser(@Param('id', ParseIntPipe) userId: number) {
        return await this.userService.getOneUser(userId);
    }

    @ApiOperation({ summary: '유저의 정보 수정' })
    @Put()
    async updateUser(@UserId() userIdToUpdate: number, @Body() updateUserDto: UpdateUserDto) {
        await this.userService.update(userIdToUpdate, updateUserDto);
        return true;
    }

    @ApiOperation({ summary: '유저 생성 / 로컬 전략 ( email, password )에 의한 회원가입' })
    @Post()
    async saveUser(@Body() createUserDto: CreateUserDto) {
        const createdUser = await this.userService.getOneByEmailWithDeleted(createUserDto.email);
        if (createdUser) {
            throw new BadRequestException(ERROR_MESSAGE.ALREADY_CREATED_USER);
        }

        return await this.userService.saveUser(createUserDto);
    }

    @ApiOperation({ summary: '유저의 정보 삭제' })
    @Delete()
    async deleteUser(@UserId() userIdToDelete: number) {
        return await this.userService.deleteOneUser(userIdToDelete);
    }
}
