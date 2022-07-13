import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { UserRepository } from '@root/entities/repositories/user.repository';
import { UserEntity } from '@root/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async getAll() {
    return await this.userRepository.find();
  }

  async saveUser(user: UserEntity) {
    return await this.userRepository.save(user)
  }
}
