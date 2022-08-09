import { IsEmail, IsInt, IsNumber } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsGender } from '@root/decorators/gender.decorator';
import { IsNotEmptyString } from '@root/decorators/is-not-empty-string.decorator';
import { IsProvider } from '@root/decorators/oauth-provider.decorator';
import { Type } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  Unique,
  OneToMany,
} from 'typeorm';
import { UserHasPhoneNumberEntity } from './address-book.entity';
import { TimeColumns } from './common/time-columns';
import { PhoneNumberEntity } from './phone-number.entity';

@Entity()
export class UserEntity extends TimeColumns {
  @PrimaryGeneratedColumn()
  id: number;

  @IsInt()
  @Column()
  @Type(() => Number) // NOTE : class-transformer
  phoneNumberId: number;

  @ApiProperty({ description: '이메일', example: 'test@test.com' })
  @IsNotEmptyString(3, 100)
  @IsEmail()
  @Column({ unique: true, length: 100 })
  email: string;

  @ApiProperty({ description: '비밀번호', example: 'password123!@#' })
  @Column()
  password: string;

  @ApiProperty({ description: '이름', example: 'kakasoo' })
  @Column()
  name: string;

  @ApiProperty({ description: '생일', example: new Date() })
  @Column()
  birth: Date;

  @ApiProperty({ description: '성별', example: 'Male' })
  @Column()
  @IsGender()
  gender: string;

  @ApiProperty({ description: 'OAuth 프로바이더', example: 'kakao' })
  @Column()
  @IsProvider()
  provider: string;

  @ApiProperty({ description: 'OAuth 아이디', example: 12345678 })
  @Column()
  @IsNumber()
  oAuthId: number;

  /**
   * NOTE : bellow are relations.
   */

  @ApiProperty({
    description: '전화번호',
    example: { phoneNumber: '01012345678' },
  })
  @OneToOne(() => PhoneNumberEntity, (phoneNumber) => phoneNumber.owner, {
    cascade: ['insert'],
  })
  @JoinColumn({ name: 'phoneNumberId', referencedColumnName: 'id' })
  phoneNumber: PhoneNumberEntity;

  @ManyToMany(
    () => PhoneNumberEntity,
    (phoneNumber) => phoneNumber.acquaintances,
  )
  @JoinTable({
    name: 'user_has_phone_numbers',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'phoneNumberId', referencedColumnName: 'id' },
  })
  addressBook: PhoneNumberEntity[];

  @OneToMany(() => UserHasPhoneNumberEntity, (bridge) => bridge.user)
  bridge: UserHasPhoneNumberEntity[];
}
