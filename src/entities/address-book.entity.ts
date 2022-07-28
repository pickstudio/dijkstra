import { IsInt, IsString } from '@nestjs/class-validator';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { TimeColumns } from './common/time-columns';
import { PhoneNumberEntity } from './phone-number.entity';
import { UserEntity } from './user.entity';

@Entity({name: 'user_has_phone_number_entity'})
@Index('composite_key_userId_and_phoneNumberId', ['userId', 'phoneNumberId'], {
  unique: true,
})
// @Unique(['userId', 'phoneNumberId'])
export class UserHasPhoneNumberEntity extends TimeColumns{
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

  @ManyToOne(() => UserEntity, (user) => user.bridge, {
    eager: false, // NOTE : 이건 사용법을 찾아보자! TypeORM 문서에 있고, 이건 JPA에도 있는 개념입니다. Lazy한 방식.
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: UserEntity;

  @ManyToOne(() => PhoneNumberEntity, (phone) => phone.bridge, {
    eager: false, // NOTE : 이건 사용법을 찾아보자! TypeORM 문서에 있고, 이건 JPA에도 있는 개념입니다. Lazy한 방식.
  })
  @JoinColumn({ name: 'phoneNumberId', referencedColumnName: 'id' })
  phoneNumber: PhoneNumberEntity;

}
