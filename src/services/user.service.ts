import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressBookDto } from '@root/dto/address-book.dto';
import { CreateUserDto, UpdateUserDto } from '@root/dto/user.dto';
import { UserHasPhoneNumberEntity } from '@root/entities/address-book.entity';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { UserHasPhoneNumberRepository } from '@root/entities/repositories/address-book.repository';
import { UserRepository } from '@root/entities/repositories/user.repository';
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
    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async getOneUserByEmail(userEmail: string) {
    return await this.userRepository.findOne({
      where: { email: userEmail },
    });
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);
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
      password: hashedPassword,
    });
  }
  async deleteOneUser(userIdToDelete: number) {
    return await this.userRepository.softDelete({ id: userIdToDelete });
  }

  async getAddressBook(userId) {
    const result = await this.addressBookRepository.find({
      relations: {
        phoneNumber: true
      },
      select: {
        phoneNumber: {
          phoneNumber: true,
        },
        phoneNickname: true,
      },
      where: {
        userId: userId
      },
    });
    return result.map(el => {
      return {
        ...el,
        phoneNumber: el.phoneNumber.phoneNumber
      }
    });
  }

  async updateAddressBook(
    userId: any,
    addressBookDto: AddressBookDto,
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
    
    const phoneNumbers = [...newSavedPhoneNumbers, ...savedPhoneNumbers];
    let updatePhoneBook = phoneNumbers.map((phoneNumberEntity) =>
      plainToClass(UserHasPhoneNumberEntity, {
        userId: userId,
        phoneNumberId: phoneNumberEntity.id,
        phoneNickname: addressBookDto.addressBook.find(
          (elem) => elem.phone == phoneNumberEntity.phoneNumber,
        ).name,
      }),
    );
    console.log(updatePhoneBook);
    // const result = await this.addressBookRepository.save(updatePhoneBook);
    const result = await this.addressBookRepository.upsert(updatePhoneBook, {
      conflictPaths: ['userId', 'phoneNumberId'],
      skipUpdateIfNoValuesChanged: true,
    });
    console.log(result);

    throw new MethodNotAllowedException();
    // return await this.userRepository.update(user, useraddressBookDto)
  }

  async getAcquaintances(userId: number, page:number, take: number) {
    // skip, take 파라미터 계산 함수
    const getSkip = (page, take) => {
      const skip = page>=1 ? (page-1) * take : 0;
      return { 
        skip: skip,
        take: take
      };
    }
    
    // 나와 아는 사람(전화번호부 조회, 1다리)
    const bridge = await this.addressBookRepository.find({
      select: {
        phoneNumberId: true,
      },
      where: {
        userId,
      },
      ...getSkip(page, take),
    });
    
    // bridge객체의 phoneNumberId: number 중에서 key를 제거하고 Array<Number>형태로 변환
    const bridgeArray = bridge.map(el => {
      return el.phoneNumberId
    });
    
    // 전화번호 1다리를 건너 아는 사람 조회(userId)
    const newFaceIds = await this.addressBookRepository.find({
      select: {
        userId: true
      },
      where: {
        userId : Not(userId),
        phoneNumberId: In(bridgeArray)
      }
    });
    
    // 위에서 반환받은 객체를 bridgeArray와 같이 변환
    const newFaceIdArray = newFaceIds.map(el => {
      return el.userId
    })

    /* 
      user 객체 조회 후 반환, **미완성**
      나중에 유저의 프로필과 자기사진(틴더, 글램 등에서는 약 5~6개)을 버킷에 업로드 후,
      최대 5개까지 저장하는 id -> photoProfile (OneToOne) 릴레이션을 참조하여 앱에서 불러오는 방식?
      을 업데이트하면 좋을거라 생각했음.
    */
    const newFaceProfileArray = this.userRepository.find({
      select: {
        name: true,
        birth: true,
      },
      where: {
        id: In(newFaceIdArray)
      }
    })

    return newFaceProfileArray;
  }
}
