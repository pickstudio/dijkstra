import { IsInt, IsString } from '@nestjs/class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { TimeColumns } from './common/time-columns';
import { PhoneNumberEntity } from './phone-number.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_has_phone_number_entity' })
export class UserHasPhoneNumberEntity extends TimeColumns {
    @IsInt()
    @PrimaryColumn()
    userId: number;

    @IsInt()
    @PrimaryColumn()
    phoneNumberId: number;

    @IsString()
    @Column({ nullable: false })
    phoneNickname: string;

    @Column({ default: false })
    isBlacked: boolean;

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
