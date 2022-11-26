import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuardWithApiBearerAuth } from '@root/decorators/api-bearer-with-jwt-guard.decorator';
import { UserId } from '@root/decorators/user-id.decorator';
import { IdentifyVerificationService } from '@root/services/identify-verification.service';

@JwtGuardWithApiBearerAuth()
@ApiTags('IdentifyVerification')
@Controller('identify-verification')
export class IdentifyVerificationController {
    constructor(private readonly identifyVerificationService: IdentifyVerificationService) {}

    @ApiOperation({ summary: '유저의 회원가입 인증 코드를 발급해주는 메일 API' })
    @Post()
    async sendIdentifyVerificationMail(@UserId() userId: number) {
        // TODO : 유저에게 메일을 보내는 로직이 작성되어야 한다.

        const identifyVerification = await this.identifyVerificationService.createRandomCode(userId);
        return identifyVerification;
    }
}
