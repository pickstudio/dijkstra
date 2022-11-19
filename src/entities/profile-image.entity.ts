import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyNumber } from '@root/decorators/is-not-empty-number.decorator';
import { IsNotEmptyString } from '@root/decorators/is-not-empty-string.decorator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommonColumns } from './common/common.columns';
import { UserEntity } from './user.entity';

@Entity()
export class ProfileImageEntity extends CommonColumns {
    @ApiProperty({ description: '프로필 사진의 주인 id' })
    @IsNotEmptyNumber()
    @Column()
    userId: number;

    @ApiProperty({ description: '이미지 경로로 s3 버킷 상의 이미지' })
    @IsNotEmptyString(1, 1024)
    @Column({ length: 1024 })
    imageUrl: string;

    @ApiProperty({ description: '대표 이미지 여부' })
    @Column()
    isDefault: boolean;

    /**
     * NOTE : bellow are relaitons.
     */

    @ManyToOne(() => UserEntity, (user) => user.profileImages)
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: UserEntity;
}
