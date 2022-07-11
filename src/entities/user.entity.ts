import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { TimeColumns } from './common/time-columns';
import { PhoneNumberEntity } from './phone-number.entity';

@Entity()
export class UserEntity extends TimeColumns {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phoneNumberId: number;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  /**
   * NOTE : bellow are relations.
   */

  @OneToOne(() => PhoneNumberEntity, (phoneNumber) => phoneNumber.owner)
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
}
