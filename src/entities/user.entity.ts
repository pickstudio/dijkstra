import { IsDate, IsEmail, IsInt, IsNotEmpty, IsOptional } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsGender } from '@root/decorators/is-gender.decorator';
import { IsNotEmptyString } from '@root/decorators/is-not-empty-string.decorator';
import { IsProvider } from '@root/decorators/oauth-provider.decorator';
import { Type } from 'class-transformer';
import { Entity, Column, OneToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { UserHasPhoneNumberEntity } from './user-has-phone-number.entity';
import { PhoneNumberEntity } from './phone-number.entity';
import { CommonColumns } from './common/common.columns';
import { IsOptionalBoolean } from '@root/decorators/is-optional-boolean.decorator';
import { IsNotEmptyNumber } from '@root/decorators/is-not-empty-number.decorator';
import { ProfileImageEntity } from './profile-image.entity';
import { PushTokenEntity } from './push-token.entity';
import { IdentifyVerificationEntity } from './identity-verification.entity';
import { IsEducation } from '@root/decorators/is-education.decorator';

@Entity()
export class UserEntity extends CommonColumns {
    @ApiProperty({ description: '자기 자신의 전화번호에 대한 FK' })
    @IsNotEmptyNumber()
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
    @IsNotEmptyString(1, 10) // NOTE : 서비스 기획 상 10글자로 제한한다.
    @Column({ length: 30, nullable: false })
    name: string;

    @ApiProperty({ description: '닉네임', example: 'kakasoo' })
    @IsNotEmptyString(1, 30)
    @Column({ length: 30, nullable: true })
    nickname: string;

    @ApiProperty({ description: '자기소개', example: '만나서 반가워요.' })
    @IsNotEmptyString(1, 300)
    @Column({ length: 300, nullable: true })
    introduce: string;

    @ApiProperty({ description: '키' })
    @IsNotEmptyNumber()
    @Column('decimal')
    height: number;

    @ApiProperty({ description: '몸무게' })
    @IsNotEmptyNumber()
    @Column('decimal')
    weight: number;

    @ApiProperty({ description: '생일', example: new Date() })
    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    @Column()
    birth: Date;

    @ApiProperty({ description: '성별', example: 'male' })
    @IsGender()
    @Column({ nullable: true })
    gender: string;

    @ApiProperty({ description: '학력', example: 'college' })
    @IsEducation()
    @Column({ nullable: true })
    education: string;

    @ApiProperty({ description: '학력을 구체적으로 기입', example: '엄석대학교' })
    @Column({ nullable: true, length: 100 })
    educationDetail: string;

    @ApiProperty({ description: 'OAuth 프로바이더', example: 'kakao' })
    @IsProvider()
    @IsOptional()
    @Column({ nullable: true })
    provider: string;

    @ApiProperty({ description: 'OAuth 아이디', example: 12345678 })
    @IsNotEmptyString(1, 100)
    @Column({ length: 100, nullable: true })
    oAuthId: string;

    @ApiProperty({ description: '주선자인지 아닌지 여부를 의미' })
    @IsOptionalBoolean()
    @Column({ default: false, nullable: false })
    isGoBetween: boolean;

    @Column('timestamp', { nullable: true })
    agreementToToS: Date;

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

    @OneToMany(() => ProfileImageEntity, (image) => image.user)
    profileImages: ProfileImageEntity[];

    @OneToMany(() => PushTokenEntity, (token) => token.user)
    pushTokens: PushTokenEntity[];

    @OneToMany(() => IdentifyVerificationEntity, (identifyVerification) => identifyVerification.user)
    identifyVerifications: IdentifyVerificationEntity[];
}
