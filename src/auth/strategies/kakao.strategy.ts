import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { AuthService } from '../auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService, private readonly authService: AuthService) {
        super({
            clientID: configService.get('KAKAO_ID'),
            callbackURL: configService.get('KAKAO_CALLBACK_URL'),
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done) {
        const profileJson = profile._json;
        const kakao_account = profileJson.kakao_account;

        const payload = {
            name: kakao_account.profile.nickname,
            oAuthId: profileJson.id,
            email: kakao_account.has_email && !kakao_account.email_needs_agreement ? kakao_account.email : null,
            gender: kakao_account.has_gender && !kakao_account.gender_needs_agreement ? kakao_account.gender : null,
        };

        done(null, payload);
    }
}
