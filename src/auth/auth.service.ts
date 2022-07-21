import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@root/services/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private userService: UserService) {}

    async validateUser(email: string, pass:string): Promise<any> {
        console.log("auth.service.ts: ");
        console.log(email, pass);
        const user = await this.userService.getOneUserByEmail(email);
        console.log(user);

        if (user) {
            if (await bcrypt.compare(pass, user.password)) {
                const {password, ...result} = user;
                return result
            }
            return new UnauthorizedException("인증 오류!")
        }
    }
}
