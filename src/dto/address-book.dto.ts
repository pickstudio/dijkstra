import { ArrayNotEmpty, IsInstance, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OneAddressDto {
    constructor({ name, phoneNumber }: { name: string; phoneNumber: string }) {
        this.name = name;
        this.phoneNumber = phoneNumber;
    }

    @ApiProperty({ description: '전화번호 이름', example: 'kakasoo' })
    @IsString()
    name: string;

    @ApiProperty({ description: '전화번호', example: '01098765432' })
    @IsString()
    phoneNumber: string;
}

export class AddressBookDto {
    @ApiProperty({ type: [OneAddressDto], description: '전화번호 배열' })
    @ArrayNotEmpty()
    @IsInstance(OneAddressDto, { each: true })
    @Type(() => OneAddressDto)
    addressBooks: OneAddressDto[];
}
