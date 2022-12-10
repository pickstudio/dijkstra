import { CustomRepository } from '@root/settings/typeorm/custom-typeorm-decorator';
import { Repository } from 'typeorm';
import { ProfileImageEntity } from '../profile-image.entity';

@CustomRepository(ProfileImageEntity)
export class ProfileImageRepository extends Repository<ProfileImageEntity> {}
