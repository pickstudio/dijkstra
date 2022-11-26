import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IdentifyVerificationEntity } from '@root/entities/identity-verification.entity';
import { IdentifyVerificationRepository } from '@root/entities/repositories/identify-verification.repository';
import { generateRandomString } from '@root/utils/functions/generate-random-string.function';

@Injectable()
export class IdentifyVerificationService {
    constructor(
        @InjectRepository(IdentifyVerificationRepository)
        private readonly identifyVerificationRepository: IdentifyVerificationRepository,
    ) {}

    async createRandomCode(userId: number): Promise<IdentifyVerificationEntity> {
        const randomCode = generateRandomString(6);
        const isCreated = await this.identifyVerificationRepository.findOne({
            where: { userId },
            order: { createAt: 'DESC' },
        });

        if (isCreated?.status === false) {
            await this.identifyVerificationRepository.softRemove(isCreated);
        }

        const newIdentifyVerifiication = await this.identifyVerificationRepository.save({
            userId,
            code: randomCode,
        });

        return newIdentifyVerifiication;
    }
}
