import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from '@root/decorators/is-not-empty-string.decorator';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToMany, OneToMany } from 'typeorm';
import { TimeColumns } from './common/time-columns';
import { UserEntity } from './user.entity';

@Entity()
export class PhoneNumberEntity extends TimeColumns {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: '8자부터 16자까지의 전화번호로, Length는 임의의 값으로 정의', example: '01012345678' })
    @IsNotEmptyString(8, 16)
    @Column({ length: 16 })
    phoneNumber: string;

    /**
     * NOTE : bellow are relations.
     */

    @OneToOne(() => UserEntity, (user) => user.phoneNumber)
    owner: UserEntity;

    @ManyToMany(() => UserEntity, (user) => user.addressBook)
    acquaintances: UserEntity[];

    @OneToMany(() => PhoneNumberEntity, (bridges) => bridges.phoneNumber)
    bridges: PhoneNumberEntity[];
}
