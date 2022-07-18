import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToMany,
  BaseEntity,
} from 'typeorm';
import { TimeColumns } from './common/time-columns';
import { UserEntity } from './user.entity';

@Entity()
export class PhoneNumberEntity extends TimeColumns {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phoneNumber: string;

  /**
   * NOTE : bellow are relations.
   */

  @OneToOne(() => UserEntity, (user) => user.phoneNumber)
  owner: UserEntity;

  @ManyToMany(() => UserEntity, (user) => user.addressBook)
  acquaintances: UserEntity[];
}
