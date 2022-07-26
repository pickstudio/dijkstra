import { IsInstance, IsString } from '@nestjs/class-validator';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { OneToOne } from 'typeorm';

export class OneAddressDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;
}

export class AddressBookDto {
  @IsInstance(OneAddressDto, { each: true })
  addressBook: OneAddressDto[];
}
