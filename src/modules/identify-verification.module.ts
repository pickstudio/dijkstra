import { Module } from '@nestjs/common';
import { IdentifyVerificationController } from '@root/controllers/identify-verification.controller';
import { IdentifyVerificationRepository } from '@root/entities/repositories/identify-verification.repository';
import { IdentifyVerificationService } from '@root/services/identify-verification.service';
import { CustomTypeOrmModule } from '@root/settings/typeorm/custom-typeorm.module';

@Module({
    imports: [CustomTypeOrmModule.forCustomRepository([IdentifyVerificationRepository])],
    controllers: [IdentifyVerificationController],
    providers: [IdentifyVerificationService],
})
export class IdentifyVerificationModule {}
