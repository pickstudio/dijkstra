import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToMany,
  BaseEntity,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class PhoneNumberEntity extends BaseEntity {
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
