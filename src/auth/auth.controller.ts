import { Controller, Post, UseGuards, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { User } from '@root/decorators/user-id.decorator';
import { UserEntity } from '@root/entities/user.entity';
import { LoginDto } from './login.dto';
import { AuthService } from './auth.service';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

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
    async kakoLoginCallback(@User() user: { name: string; oAuthId: number; email: string; gender: string }) {}

    @UseGuards(KakaoAuthGuard)
    @Get('kakao/sign-up')
    async kakaoSignUp(): Promise<void> {}

    @Get('kakao/login-in')
    async kakaoLogin(): Promise<void> {}
}
