import { BadRequestException, Injectable, MethodNotAllowedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressBookDto } from '@root/dto/address-book.dto';
import { PageParamDto } from '@root/dto/common/search-pagination.dto';
import { CreateUserDto } from '@root/dto/create-user.dto';
import { UpdateUserDto } from '@root/dto/update-user.dto';
import { UserHasPhoneNumberEntity } from '@root/entities/address-book.entity';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { UserHasPhoneNumberRepository } from '@root/entities/repositories/address-book.repository';
import { UserRepository } from '@root/entities/repositories/user.repository';
import { ERROR_MESSAGE } from '@root/utils/error-message';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
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
            withDeleted: true,
            where: { email },
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

    async getOneUserByEmail(userEmail: string) {
        return await this.userRepository.findOne({
            where: { email: userEmail },
        });
    }

    async update(userId: number, updateUserDto: UpdateUserDto) {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 8);
        }
        return await this.userRepository.update({ id: userId }, updateUserDto);
    }

    async getAll() {
        return await this.userRepository.find();
    }

    async saveUser(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 8);

        return await this.userRepository.save({
            ...createUserDto,
            privder: 'local',
            password: hashedPassword,
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

    async getAddressBook(userId) {
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

    async updateAddressBook(userId: any, addressBookDto: AddressBookDto) {
        // 1. DB에 저장된 휴대폰 번호 조회
        const savedPhoneNumbers = await PhoneNumberEntity.find({
            where: {
                phoneNumber: In(addressBookDto.addressBook.map((elem) => elem.phone)),
            },
        });
        // 2. Array<Number>형태로 변환
        const savedOnlyNumbers = savedPhoneNumbers.map((entity) => {
            return entity.phoneNumber;
        });
        // 3. 2번의 Array를 통해 저장되지 않은 번호 추출
        const unsavedPhoneNumbers = addressBookDto.addressBook.filter((item) => {
            if (savedOnlyNumbers.includes(item.phone)) {
                return false;
            }
            return true;
        });
        // 4. 3번에서 추출된 번호 저장
        const newSavedPhoneNumbers = await PhoneNumberEntity.save(
            unsavedPhoneNumbers.map((elem) =>
                plainToClass(PhoneNumberEntity, {
                    phoneNumber: elem.phone,
                }),
            ),
        );
        // 5. userHasPhoneNumberEntity 형태로 가공: [userId, phoneNumberId, phoneNickname]
        const phoneNumbers = [...newSavedPhoneNumbers, ...savedPhoneNumbers];
        let updatePhoneBook = phoneNumbers.map((phoneNumberEntity) =>
            plainToClass(UserHasPhoneNumberEntity, {
                userId: userId,
                phoneNumberId: phoneNumberEntity.id,
                phoneNickname: addressBookDto.addressBook.find((elem) => elem.phone == phoneNumberEntity.phoneNumber)
                    .name,
            }),
        );
        // 6. 신규 저장 번호와 기존 저장 번호 모두 전화번호부 등록(upsert)
        const result = await this.addressBookRepository.upsert(updatePhoneBook, {
            conflictPaths: ['userId', 'phoneNumberId'],
            skipUpdateIfNoValuesChanged: true,
        });

        // 7. 반환형태 미지정으로 인한 오류 반환
        throw new MethodNotAllowedException();
        // return await this.userRepository.update(user, useraddressBookDto)
    }

    async getAcquaintances(userId: number, pageParamDto: PageParamDto) {
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
            ...pageParamDto,
        });
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
        console.log(newFaceIds);

        // 위에서 반환받은 객체를 bridgeArray와 같이 변환
        const newFaceIdArray = newFaceIds.map((el) => {
            return el.userId;
        });

        // 한 다리 건넌 사람과 같이 아는 전화번호의 id로 누구를 통했는지 추적
        const chasingNickname = newFaceIds.map((el) => {
            const target = bridge.find((el_bridge) => {
                return el_bridge.phoneNumberId == el.phoneNumberId;
            });
            return {
                ...el,
                bridgeNickname: target.phoneNickname,
            };
        });
        console.log(chasingNickname);
        /* 
      user 객체 조회 후 반환, **미완성**
      나중에 유저의 프로필과 자기사진(틴더, 글램 등에서는 약 5~6개)을 버킷에 업로드 후,
      최대 5개까지 저장하는 id -> photoProfile (OneToOne) 릴레이션을 참조하여 앱에서 불러오는 방식?
      을 업데이트하면 좋을거라 생각했음.
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
        console.log(newFaceProfileArray);

        // 한 다리 건너 누구를 통해 알게 되었는지 내 전화번호부의 번호 별명을 같이 전달.
        const result = newFaceProfileArray.map((el) => {
            const target = chasingNickname.find((el_chase) => {
                return el_chase.userId == el.id;
            });
            return {
                ...el,
                bridge: target.bridgeNickname,
            };
        });
        console.log(result);
        return result;
    }
}
