import { IsDate, IsEmail, IsInt, IsOptional } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsGender } from '@root/decorators/gender.decorator';
import { IsNotEmptyString } from '@root/decorators/is-not-empty-string.decorator';
import { IsProvider } from '@root/decorators/oauth-provider.decorator';
import { Type } from 'class-transformer';
import { Entity, Column, OneToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { UserHasPhoneNumberEntity } from './user-has-phone-number.entity';
import { PhoneNumberEntity } from './phone-number.entity';
import { CommonColumns } from './common/common.columns';

@Entity()
export class UserEntity extends CommonColumns {
    @ApiProperty({ description: '자기 자신의 전화번호에 대한 FK' })
    @IsInt()
    @Type(() => Number) // NOTE : class-transformer
    @Column()
    phoneNumberId: number;

    @ApiProperty({ description: '이메일', example: 'test@test.com' })
    @IsNotEmptyString(3, 100)
    @IsEmail()
    @Column({ unique: true, length: 100, nullable: true })
    email: string;

    @ApiProperty({ description: '비밀번호', example: 'password123!@#' })
    @IsNotEmptyString(0, 30)
    @Column({ length: 1000, select: false, nullable: true })
    password: string;

    @ApiProperty({ description: '이름', example: 'kakasoo' })
    @IsNotEmptyString(1, 30)
    @Column({ length: 30, nullable: false })
    name: string;

    @ApiProperty({ description: '생일', example: new Date() })
    @IsDate()
    @Type(() => Date)
    @Column()
    birth: Date;

    @ApiProperty({ description: '성별', example: 'male' })
    @IsGender()
    @Column({ nullable: true })
    gender: string;

    @ApiProperty({ description: 'OAuth 프로바이더', example: 'kakao' })
    @IsProvider()
    @IsOptional()
    @Column({ nullable: true })
    provider: string;

    @ApiProperty({ description: 'OAuth 아이디', example: 12345678 })
    @IsNotEmptyString(1, 100)
    @Column({ length: 100, nullable: true })
    oAuthId: string;

    /**
     * NOTE : bellow are relations.
     */

    @OneToOne(() => PhoneNumberEntity, (phoneNumber) => phoneNumber.owner, {
        cascade: ['insert'],
    })
    @JoinColumn({ name: 'phoneNumberId', referencedColumnName: 'id' })
    phoneNumber: PhoneNumberEntity;

    @ManyToMany(() => PhoneNumberEntity, (phoneNumber) => phoneNumber.acquaintances)
    @JoinTable({
        name: 'user_has_phone_number_entity',
        joinColumn: { name: 'userId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'phoneNumberId', referencedColumnName: 'id' },
    })
    addressBook: PhoneNumberEntity[];

    @OneToMany(() => UserHasPhoneNumberEntity, (bridge) => bridge.user)
    bridges: UserHasPhoneNumberEntity[];
}
