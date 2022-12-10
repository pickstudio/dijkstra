import { PickType } from '@nestjs/swagger';
import { ProfileImageEntity } from '@root/entities/profile-image.entity';

export class ProfileImageDto extends PickType(ProfileImageEntity, ['imageUrl', 'isDefault'] as const) {}
