import { IsInstance, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { OneToOne } from 'typeorm';

export class OneAddressDto {
  @ApiProperty({ description: '전화번호 이름', example: 'kakasoo' })
  @IsString()
  name: string;

  @ApiProperty({ description: '전화번호', example: '01098765432' })
  @IsString()
  phone: string;
}

const exampleArray: OneAddressDto[] = [
  {
    name: 'kakasoo',
    phone: '01098765432',
  },
  {
    name: 'drakejin',
    phone: '01077777777',
  },
];

export class AddressBookDto {
  @ApiProperty({
    description: '전화번호 배열',
    example: exampleArray,
  })
  @IsInstance(OneAddressDto, { each: true })
  addressBook: OneAddressDto[];
}
