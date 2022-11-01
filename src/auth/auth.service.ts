import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '@root/entities/user.entity';
import { UserService } from '@root/services/user.service';
import { ERROR_MESSAGE } from '@root/utils/error-message';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.getOneUserByEmailForAuth(email);
        if (user) {
            const isRightPassword = await bcrypt.compare(password, user.password);
            if (isRightPassword) {
                const { password, ...rest } = user;
                return rest;
            }
        }
        throw new UnauthorizedException(ERROR_MESSAGE.FAIL_AUTH);
    }

    login(user: UserEntity) {
        const payload = { username: user.name, userId: user.id };
        const accessToken = this.jwtService.sign(payload);

        return accessToken;
    }

    kakaoLogin(user: UserEntity) {
        return user;
    }
}
