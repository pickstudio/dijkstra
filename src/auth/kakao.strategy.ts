import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { UserRepository } from "@root/entities/repositories/user.repository";
import { Strategy } from "passport-kakao";
import { AuthService } from "./auth.service";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
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
    console.log('\n  - kakao_account.profile: ');
    console.log(kakao_account.profile);
    // const userExist = this.userRepository.find({
    //   where: {
    //     provider: 'kakao',
    //     oAuthId: profile,
    //   }
    // });
    // console.log('\n  - userExist:');
    // console.log(userExist);
    
    const payload = {
        name: kakao_account.profile.nickname,
        oAuthId: profileJson.id,
        email: 
          kakao_account.has_email && !kakao_account.email_needs_agreement 
            ? kakao_account.email 
            : null,
        gender: 
          kakao_account.has_gender && !kakao_account.gender_needs_agreement
            ? kakao_account.gender
            : null,
    };
    done(null, payload);
  }
}
