import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '@root/entities/user.entity';
import { UserService } from '@root/services/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.getOneUserByEmail(email);

    if (user) {
      if (await bcrypt.compare(pass, user.password)) {
        const { password, ...result } = user;
        return result;
      }
      return new UnauthorizedException('인증 오류!');
    }
  }

  async login(user: UserEntity) {
    const payload = { username: user.name, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async kakaoLogin(user) {
    console.log(user);
    return user;
  }
}
