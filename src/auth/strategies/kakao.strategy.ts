import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { CreateOAuthUserDto } from '@root/types';
import { Strategy, Profile } from 'passport-kakao';
import { AuthService } from '../auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
    constructor(protected readonly configService: ConfigService, private readonly authService: AuthService) {
        super({
            clientID: configService.get('KAKAO_ID'),
            callbackURL: configService.get('KAKAO_CALLBACK_URL'),
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: (err, payload) => {}) {
        const profileJson: { id: number; kakao_account: KakaoAccount } = profile._json;
        const kakao_account = profileJson.kakao_account;

        const payload: CreateOAuthUserDto = {
            provider: profile.provider as 'kakao',
            nickname: kakao_account.profile.nickname,
            oAuthId: String(profileJson.id),

            // NOTE : gender, age_range, birthday, profile_image property 수집 가능
        };

        done(null, payload);
    }
}
