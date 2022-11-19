import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyNumber } from '@root/decorators/is-not-empty-number.decorator';
import { IsNotEmptyString } from '@root/decorators/is-not-empty-string.decorator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommonColumns } from './common/common.columns';
import { UserEntity } from './user.entity';

@Entity()
export class PushTokenEntity extends CommonColumns {
    @ApiProperty({ description: '토큰에 해당하는 유저 id' })
    @IsNotEmptyNumber()
    @Column()
    userId: number;

    @ApiProperty({ description: '토큰 값' })
    @IsNotEmptyString(1, 1024)
    @Column({ length: 1024 })
    value: string;

    /**
     * NOTE : bellow are relaitons.
     */

    @ManyToOne(() => UserEntity, (user) => user.pushTokens)
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: UserEntity;
}
