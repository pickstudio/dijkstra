import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyNumber } from '@root/decorators/is-not-empty-number.decorator';
import { IsNotEmptyString } from '@root/decorators/is-not-empty-string.decorator';
import { IsOptionalBoolean } from '@root/decorators/is-optional-boolean.decorator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { TimeColumns } from './common/time-columns';
import { PhoneNumberEntity } from './phone-number.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_has_phone_number_entity' })
export class UserHasPhoneNumberEntity extends TimeColumns {
    @ApiProperty({ description: '유저의 id' })
    @IsNotEmptyNumber()
    @PrimaryColumn()
    userId: number;

    @ApiProperty({ description: '전화번호의 id' })
    @IsNotEmptyNumber()
    @PrimaryColumn()
    phoneNumberId: number;

    @ApiProperty({ description: 'user가 phoneNumber를 무슨 식별자로 저장했는지를 의미' })
    @IsNotEmptyString(1, 64)
    @Column({ length: 64 })
    phoneNickname: string;

    @ApiProperty({ description: 'user가 해당 번호를 통해 연결을 받고 싶은지 여부를 의미 / true면 거부' })
    @IsOptionalBoolean()
    @Column({ default: false })
    isBlocked: boolean;

    /**
     * below are relations
     */

    @ManyToOne(() => UserEntity, (user) => user.bridges, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: UserEntity;

    @ManyToOne(() => PhoneNumberEntity, (phone) => phone.bridges, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'phoneNumberId', referencedColumnName: 'id' })
    phoneNumber: PhoneNumberEntity;
}
