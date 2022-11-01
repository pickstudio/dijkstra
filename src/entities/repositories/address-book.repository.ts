import { CustomRepository } from '@root/settings/typeorm/custom-typeorm-decorator';
import { Repository } from 'typeorm';
import { UserHasPhoneNumberEntity } from '../user-has-phone-number.entity';

@CustomRepository(UserHasPhoneNumberEntity)
export class UserHasPhoneNumberRepository extends Repository<UserHasPhoneNumberEntity> {}
