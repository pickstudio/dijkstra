import { BadGatewayException, Injectable } from '@nestjs/common';
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
        if (!user) {
            throw new BadGatewayException(ERROR_MESSAGE.FAIL_AUTH);
        }

        const isRightPassword = await bcrypt.compare(password, user.password);
        if (!isRightPassword) {
            throw new BadGatewayException(ERROR_MESSAGE.FAIL_AUTH);
        }

        delete user.password;
        return user;
    }

    login(user: UserEntity) {
        const payload = { username: user.name, userId: user.id };
        const accessToken = this.jwtService.sign(payload);

        return accessToken;
    }

    async kakaoLogin(oauthId: string) {
        // await this.userService.
    }
}
