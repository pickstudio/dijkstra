import { IsArray } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from '@root/decorators/is-not-empty-string.decorator';
import { Type } from 'class-transformer';

export class CreateTestFlightAddressDto {
    @ApiProperty({ description: '사용자가 저장한 다른 사람의 이름', example: 'friendName' })
    @IsNotEmptyString(0, 100)
    name: string;

    @ApiProperty({ description: '저장 타입', example: '모바일' })
    @IsNotEmptyString(0, 100)
    type: string;

    @ApiProperty({ description: '사용자가 저장한 다른 사람의 번호', example: '010-8525-7658' })
    @IsNotEmptyString(0, 100)
    phoneNumber: string;
}

export class CreateTestFlightDto {
    @ApiProperty({ description: '사용자의 이름, 전화번호부의 소유자', example: 'kakasoo' })
    nickName: string;

    @ApiProperty({ description: '본인의 전화번호', example: '010-8525-7658' })
    @IsNotEmptyString(0, 100)
    phoneNumber?: string;

    @ApiProperty({ description: '사용자의 전화번호부', type: [CreateTestFlightAddressDto] })
    @IsArray()
    @Type(() => CreateTestFlightAddressDto)
    data: CreateTestFlightAddressDto[];
}
