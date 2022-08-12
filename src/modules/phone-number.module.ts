import { Module } from '@nestjs/common';
import { PhoneNumberRepository } from '@root/entities/repositories/phone-number.repository';
import { PhoneNumberService } from '@root/services/phone-number.service';
import { CustomTypeOrmModule } from '@root/settings/typeorm/custom-typeorm.module';

@Module({
    imports: [CustomTypeOrmModule.forCustomRepository([PhoneNumberRepository])],
    providers: [PhoneNumberService],
    exports: [PhoneNumberService],
})
export class PhoneNumberModule {}
