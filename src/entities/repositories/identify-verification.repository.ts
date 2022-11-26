import { CustomRepository } from '@root/settings/typeorm/custom-typeorm-decorator';
import { IdentifyVerificationEntity } from '../identity-verification.entity';
import { Repository } from 'typeorm';

@CustomRepository(IdentifyVerificationEntity)
export class IdentifyVerificationRepository extends Repository<IdentifyVerificationEntity> {}
