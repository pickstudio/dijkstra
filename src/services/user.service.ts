import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, UpdateUserDto } from '@root/dto/user.dto';
import { UserRepository } from '@root/entities/repositories/user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async getOneByEmailWithDeleted(email: string) {
    const user = await this.userRepository.findOne({
      withDeleted: true,
      where: { email },
    });

    return user;
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
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
}
