import { Injectable } from '@nestjs/common';
import { UserHasPhoneNumberRepository } from '@root/entities/repositories/address-book.repository';
import { UserRepository } from '@root/entities/repositories/user.repository';

@Injectable()
export class DataService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly userHasPhoneNumberRepository: UserHasPhoneNumberRepository,
    ) {}

    async getData() {
        return await this.userRepository.find({
            select: {
                name: true,
                email: true,
                bridges: {
                    phoneNickname: true,
                    phoneNumber: {
                        phoneNumber: true,
                    },
                },
            },
            relations: ['bridges', 'bridges.phoneNumber'],
        });
    }
}
