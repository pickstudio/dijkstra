import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CommonColumns } from './common/common.columns';
import { UserEntity } from './user.entity';

@Entity()
export class IdentifyVerificationEntity extends CommonColumns {
    @ApiProperty({ description: '본인 인증을 수행하려는 유저의 아이디' })
    @Column()
    userId: number;

    @ApiProperty({ description: '본인 인증을 위한 코드' })
    @Column({ length: 100 })
    code: string;

    @ApiProperty({ description: 'true일 경우, 이미 인증을 완료한 코드라는 의미' })
    @Column({ default: false })
    status: boolean;

    /**
     * NOTE : bellow are relations.
     */

    @ManyToOne(() => UserEntity, (user) => user.identifyVerifications)
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: UserEntity;
}
