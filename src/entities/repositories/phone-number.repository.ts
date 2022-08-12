import { CustomRepository } from '@root/settings/typeorm/custom-typeorm-decorator';
import { Repository } from 'typeorm';
import { PhoneNumberEntity } from '../phone-number.entity';

@CustomRepository(PhoneNumberEntity)
export class PhoneNumberRepository extends Repository<PhoneNumberEntity> {}
