import { Controller, Post, UseGuards, Request, Get, Req, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { User } from '@root/decorators/user-id.decorator';
import { UserEntity } from '@root/entities/user.entity';
import { LoginInfo } from './auth.input';
import { AuthService } from './auth.service';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

    @ApiBody({ description: '로그인', type: LoginInfo })
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@User() user: UserEntity) {
        return this.authService.login(user);
    }

    @UseGuards(KakaoAuthGuard)
    @Get('kakao')
    async kakaoLogin(@Request() req) {
        return HttpStatus.OK;
    }

    @UseGuards(KakaoAuthGuard)
    @Get('kakao/callback')
    async kakoLoginCallback(@User() user: UserEntity) {
        return this.authService.kakaoLogin(user);
    }
}
