import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-kakao";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
        clientID: configService.get('KAKAO_ID'),
        callbackURL: configService.get('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(accessToken, refreshToken, profile, done) {
    const profileJson = profile._json;
    const kakao_account = profileJson.kakao_account;
    console.log('kakao.strategy.ts: ');
    console.log('  - profile: ');
    console.log(profile);
    console.log('\n  - profile.profile: ');
    console.log(profile.profile);
    const payload = {
        name: kakao_account.profile.nickname,
        kakaoId: profileJson.id,
        email: 
          kakao_account.has_email && !kakao_account.email_needs_agreement 
            ? kakao_account.email 
            : null,
    };
    done(null, payload);
  }
}
