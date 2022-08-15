import { PickType } from '@nestjs/swagger';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';

export class CreatePhoneNumberDto extends PickType(PhoneNumberEntity, ['phoneNumber'] as const) {}
