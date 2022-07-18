import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  Unique,
} from 'typeorm';
import { TimeColumns } from './common/time-columns';
import { PhoneNumberEntity } from './phone-number.entity';

@Entity()
@Unique(['email'])
export class UserEntity extends TimeColumns {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phoneNumberId: number;

  @Column({unique: true})
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  birth: Date;

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
