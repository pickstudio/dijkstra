import { Controller, Post, UseGuards, Get, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { User } from '@root/decorators/user-id.decorator';
import { UserEntity } from '@root/entities/user.entity';
import { LoginDto } from './login.dto';
import { AuthService } from './auth.service';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateOAuthUserDto } from '@root/types';
import { LoginOAuthUserDto } from '@root/dto/login-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

    @ApiBody({ description: '로그인', type: LoginDto })
    @UseGuards(LocalAuthGuard)
    @Post('local/login')
    login(@User() user: UserEntity) {
        return this.authService.login(user);
    }

    @UseGuards(KakaoAuthGuard)
    @Get('kakao/callback')
    async kakoLoginCallback(@User() user: CreateOAuthUserDto) {
        await this.authService.kakaoSignUp(user);
    }

    @UseGuards(KakaoAuthGuard)
    @Get('kakao/sign-up')
    async kakaoSignUp(): Promise<void> {}

    @Get('kakao/login')
    async kakaoLogin(@Body() { oAuthId }: LoginOAuthUserDto, pushToken?: string) {
        await this.authService.kakaoLogin(oAuthId, pushToken);
    }
}
