import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    // email 중복가입 방지
    let isNotDuplicated;
    try { // 전달받은 이메일 조회
      isNotDuplicated = UserEntity.findOne({where: {email: user.email}})
      console.log("flow: try")
    }catch { // 중복 시 403 Exception 발생
      console.log("flow: catch")
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'This email is already joined'
      }, HttpStatus.FORBIDDEN)
    }

    return await this.userRepository.save(user)
  }
}
