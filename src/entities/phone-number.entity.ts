import { IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToMany, OneToMany } from 'typeorm';
import { TimeColumns } from './common/time-columns';
import { UserEntity } from './user.entity';

@Entity()
export class PhoneNumberEntity extends TimeColumns {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: '전화번호', example: '01012345678' })
    @IsString()
    @Column()
    phoneNumber: string;

    /**
     * NOTE : bellow are relations.
     */

    @OneToOne(() => UserEntity, (user) => user.phoneNumber)
    owner: UserEntity;

    @ManyToMany(() => UserEntity, (user) => user.addressBook)
    acquaintances: UserEntity[];

    @OneToMany(() => PhoneNumberEntity, (bridge) => bridge.phoneNumber)
    bridge: PhoneNumberEntity[];
}
