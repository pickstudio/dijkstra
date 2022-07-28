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
    console.log('user.servie.ts: (getAcuaintances)\n  - user:');
    console.log(userId, page, take);
    const getSkip = (page, take) => {
      const skip = page>=1 ? (page-1) * take : 0;
      return { 
        skip: skip,
        take: take
      };
    }
    console.log(getSkip(page, take));

    const bridge = await this.addressBookRepository.find({
      select: {
        phoneNumberId: true,
      },
      where: {
        userId,
      },
      ...getSkip(page, take),
    });
    console.log(bridge);
    
    const bridgeArray = bridge.map(el => {
      return el.phoneNumberId
    });
    console.log(bridgeArray);

    const newFace = this.addressBookRepository.find({
      select: {
        userId: true
      },
      where: {
        userId : Not(userId),
        phoneNumberId: In(bridgeArray)
      }
    });
    console.log(newFace);
    return bridgeArray;
  }
}
