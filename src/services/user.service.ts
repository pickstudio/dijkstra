import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, UpdateUserDto } from '@root/dto/user.dto';
import { UserHasPhoneNumberEntity } from '@root/entities/address-book.entity';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { UserHasPhoneNumberRepository } from '@root/entities/repositories/address-book.repository';
import { UserRepository } from '@root/entities/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly addressBookRepository: UserHasPhoneNumberRepository
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
      where: { email: userEmail }
    })
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
    return await this.userRepository.softDelete({id: userIdToDelete});
  }
  async updateAddressBook(userToken: any, phoneNumbers: PhoneNumberEntity[]) {
    let updatePhoneBook = phoneNumbers.map(
      phoneNumberEntity => plainToClass(UserHasPhoneNumberEntity, {
        userId: userToken.userId,
        phoneNumberId: phoneNumberEntity.id
      }
    ));
    const result = await this.addressBookRepository.save(updatePhoneBook);
    
    throw new MethodNotAllowedException();  
    // return await this.userRepository.update(user, useraddressBookDto)
  }
}
