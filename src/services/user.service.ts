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
        // 나와 아는 사람(전화번호부 조회, 1다리)
        // [phoneNumberId(전화번호부에 등록된 사람), phoneNickname(저장된 별명)]
        const bridges = await this.addressBookRepository.find({
            select: { phoneNumberId: true, phoneNickname: true },
            where: { userId },
            ...getSkipAndTake(searchPaginationDto),
        });

        // bridge객체의 phoneNumberId: number 중에서 key를 제거하고 Array<Number>형태로 변환
        const phoneNumberIds = bridges.map((el) => el.phoneNumberId);

        // 전화번호 1다리를 건너 아는 사람 조회
        // [userId(한 다리 건넌 사람), phoneNumberId(내 전화번호부에 등록된 사람)]
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
        console.log(newFaceIds);

        // 위에서 반환받은 객체를 phoneNumberIds와 같이 변환
        const newFaceIdArray = newFaceIds.map((el) => {
            return el.userId;
        });

        // 한 다리 건넌 사람과 같이 아는 전화번호의 id로 누구를 통했는지 추적
        const chasingNickname = newFaceIds.map((el) => {
            const target = bridges.find((bridge) => bridge.phoneNumberId == el.phoneNumberId);
            return { ...el, bridgeNickname: target.phoneNickname };
        });

        /*
         * user 객체 조회 후 반환, **미완성**
         * 나중에 유저의 프로필과 자기사진(틴더, 글램 등에서는 약 5~6개)을 버킷에 업로드 후,
         * 최대 5개까지 저장하는 id -> photoProfile (OneToOne) 릴레이션을 참조하여 앱에서 불러오는 방식?
         * 을 업데이트하면 좋을거라 생각했음.
         */

        // [id(한 다리 건넌 사람), name, birth]
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

        // 한 다리 건너 누구를 통해 알게 되었는지 내 전화번호부의 번호 별명을 같이 전달.
        const result = newFaceProfileArray.map((el) => {
            const target = chasingNickname.find((el_chase) => {
                return el_chase.userId == el.id;
            });
            return { ...el, bridge: target.bridgeNickname };
        });
        return result;
    }

    async getAcquaintancesForTest(userId: number, searchPaginationDto: SearchPaginationDto) {
        /* 
        예시 상황:
            A ~ F가 있을 때,
            A의 전화번호부에는 가입자 B ~ E까지의 전화번호가 저장되어 있고
            가입자 B ~ D의 전화번호부에는 F가 존재할 때,
            A에게 F를 노출하면서 Bridge(중간다리) 유저로 B~D가 함께 알고 있음을 표시.
        */

        // 나와 아는 사람(전화번호부 조회, 1다리)
        // [phoneNumberId(전화번호부에 등록된 사람), phoneNickname(저장된 별명)]
        const bridge = await this.addressBookRepository.find({
            select: {
                phoneNumberId: true,
                phoneNickname: true,
            },
            where: {
                userId,
            },
            ...getSkipAndTake(searchPaginationDto),
        });
        console.log('\nbridge:');
        console.log(bridge);

        // bridge객체의 phoneNumberId: number 중에서 key를 제거하고 Array<Number>형태로 변환
        const bridgeArray = bridge.map((el) => {
            return el.phoneNumberId;
        });

        // 전화번호 1다리를 건너 아는 사람 조회
        // [userId(한 다리 건넌 사람), phoneNumberId(내 전화번호부에 등록된 사람)]
        const newFaceIds = await this.addressBookRepository.find({
            select: {
                userId: true,
                phoneNumberId: true,
            },
            where: {
                userId: Not(userId),
                phoneNumberId: In(bridgeArray),
            },
        });
        console.log('\nnewFaceIds:');
        console.log(newFaceIds);

        // 위에서 반환받은 객체를 bridgeArray와 같이 변환
        // const newFaceIdArray = newFaceIds.map((el) => {
        //     return el.userId;
        // });

        // 한 다리 건넌 사람과 같이 아는 전화번호의 id로 누구를 통했는지 추적
        const chasingNickname = newFaceIds.map((el) => {
            const target = bridge
                .filter((el_bridge) => {
                    return el_bridge.phoneNumberId == el.phoneNumberId;
                })
                .map((el) => {
                    return el.phoneNickname;
                });
            return {
                userId: el.userId,
                bridgeNickname: [...target],
            };
        });
        // console.log('\nchasingNickname: ');
        // console.log(chasingNickname);

        // 추적한 bridgeNickname들을 userId 값으로 묶어 배열화
        const mergedArray = Object.values(
            chasingNickname.reduce((obj, item) => {
                const uid = Number(item.userId);
                obj[uid] ? obj[uid].bridgeNickname.push(...item.bridgeNickname) : (obj[uid] = { ...item });
                return obj;
            }, {}),
        );
        console.log('\nmergedArray: ');
        console.log(mergedArray);

        // userId에 대한 프로필 조회
        const profilesForMergedArray = await this.userRepository.find({
            where: {
                id: In(
                    mergedArray.map((el: { userId: number }) => {
                        return el.userId;
                    }),
                ),
            },
            select: {
                id: true,
                name: true,
                gender: true,
                birth: true,
            },
        });
        console.log('profilesForMergedArray: ');
        console.log(profilesForMergedArray);

        // 조회한 프로필과 bridgeNickname 배열을 엮어 반환
        const mergedArrayWithProfile = mergedArray.map((el: { userId: number; bridgeNickname: Array<string> }) => {
            const target_profile = profilesForMergedArray.find((el_profile) => {
                return el_profile.id == el.userId;
            });
            return { ...target_profile, bridgeNicknames: el.bridgeNickname };
        });
        console.log('\nmergedArrayWithProfile: ');
        console.log(mergedArrayWithProfile);
        return mergedArrayWithProfile;
    }
}
