import { ValidateNested } from '@nestjs/class-validator';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { UserEntity } from '@root/entities/user.entity';
import { Type } from 'class-transformer';
import { CreatePhoneNumberDto } from './create-phone-number.dto';

export class CreateUserDto extends PickType(UserEntity, ['email', 'name', 'birth', 'password', 'gender'] as const) {
    @ApiProperty({ type: CreatePhoneNumberDto })
    @Type(() => CreatePhoneNumberDto)
    @ValidateNested()
    phoneNumber: CreatePhoneNumberDto;
}
