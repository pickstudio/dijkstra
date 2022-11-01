import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchPaginationDto } from '@root/dto/common/search-pagination.dto';
import { CreateUserDto } from '@root/dto/create-user.dto';
import { UpdateUserDto } from '@root/dto/update-user.dto';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { UserHasPhoneNumberRepository } from '@root/entities/repositories/address-book.repository';
import { UserRepository } from '@root/entities/repositories/user.repository';
import { ERROR_MESSAGE } from '@root/utils/error-message';
import { getSkipAndTake } from '@root/utils/functions/get-skip-and-take.function';
import * as bcrypt from 'bcrypt';
import { In, Not } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository,
        private readonly addressBookRepository: UserHasPhoneNumberRepository,
    ) {}

    async getOneByEmailWithDeleted(email: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            withDeleted: true,
        });

        return user;
    }

    async getOneUser(userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException(ERROR_MESSAGE.CANNOT_FIND_ONE_USER);
        }

        return user;
    }

    async getOneUserByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email },
        });
    }

    async getOneUserByEmailForAuth(email: string) {
        return await this.userRepository.findOne({
            where: { email },
            select: {
                email: true,
                password: true,
                name: true,
                id: true,
            },
        });
    }

    async getProfile(userId: number) {
        const { email, ...profile } = await this.userRepository.findOne({
            where: {
                id: userId,
            },
            select: {
                name: true,
                birth: true,
                gender: true,
            },
        });
        return profile;
    }

    async update(userId: number, updateUserDto: UpdateUserDto) {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 8);
        }
        return await this.userRepository.update({ id: userId }, updateUserDto);
    }

    async saveUser(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 8);

        return await this.userRepository.save({
            ...createUserDto,
            provider: 'local',
            password: hashedPassword,
            oAuthId: null,
        });
    }
    async deleteOneUser(userIdToDelete: number) {
        return await this.userRepository.softDelete({ id: userIdToDelete });
    }

    async saveKakaoUser(user) {
        return await this.userRepository.save({
            ...user,
        });
    }

    async getAddressBook(userId: number) {
        const result = await this.addressBookRepository.find({
            relations: {
                phoneNumber: true,
            },
            select: {
                phoneNumber: {
                    phoneNumber: true,
                },
                phoneNickname: true,
            },
            where: {
                userId: userId,
            },
        });
        return result.map((el) => {
            return {
                ...el,
                phoneNumber: el.phoneNumber.phoneNumber,
            };
        });
    }

    async getMyPhoneNumber(userId: number): Promise<PhoneNumberEntity[]> {
        const { addressBook } = await this.userRepository.findOne({
            relations: { addressBook: true },
            where: { id: userId },
        });

        return addressBook;
    }

    async getAcquaintances(userId: number, searchPaginationDto: SearchPaginationDto) {
        // NOTE : 나와 아는 사람(전화번호부 조회, 1다리)
        const bridges = await this.addressBookRepository.find({
            select: { phoneNumberId: true, phoneNickname: true },
            where: { userId },
            ...getSkipAndTake(searchPaginationDto),
        });

        // NOTE : bridge객체의 phoneNumberId: number 중에서 key를 제거하고 Array<Number>형태로 변환
        const phoneNumberIds = bridges.map((el) => el.phoneNumberId);

        // NOTE : 전화번호 1다리를 건너 아는 사람 조회
        const newFaceIds = await this.addressBookRepository.find({
            select: {
                userId: true,
                phoneNumberId: true,
            },
            where: {
                userId: Not(userId),
                phoneNumberId: In(phoneNumberIds),
            },
        });

        // NOTE : 위에서 반환받은 객체를 phoneNumberIds와 같이 변환
        const newFaceIdArray = newFaceIds.map((el) => {
            return el.userId;
        });

        // NOTE : 한 다리 건넌 사람과 같이 아는 전화번호의 id로 누구를 통했는지 추적
        const chasingNickname = newFaceIds.map((el) => {
            const target = bridges.find((bridge) => bridge.phoneNumberId == el.phoneNumberId);
            return { ...el, bridgeNickname: target.phoneNickname };
        });

        const newFaceProfileArray = await this.userRepository.find({
            select: {
                id: true,
                name: true,
                birth: true,
            },
            where: {
                id: In(newFaceIdArray),
            },
        });

        // NOTE : 한 다리 건너 누구를 통해 알게 되었는지 내 전화번호부의 번호 별명을 같이 전달.
        const result = newFaceProfileArray.map((el) => {
            const target = chasingNickname.find((el_chase) => {
                return el_chase.userId == el.id;
            });
            return { ...el, bridge: target.bridgeNickname };
        });
        return result;
    }
}
