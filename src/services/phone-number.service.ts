import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PhoneNumberRepository } from '@root/entities/repositories/phone-number.repository';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { In } from 'typeorm';
import { UserHasPhoneNumberRepository } from '@root/entities/repositories/address-book.repository';
import { OneAddressDto } from '@root/dto/address-book.dto';
import { UserEntity } from '@root/entities/user.entity';

@Injectable()
export class PhoneNumberService {
    constructor(
        @InjectRepository(PhoneNumberRepository)
        private readonly phoneNumberRepository: PhoneNumberRepository,
        @InjectRepository(UserHasPhoneNumberRepository)
        private readonly userHasPhoneNumberRepository: UserHasPhoneNumberRepository,
    ) {}

    async saveOrIgnore(phoneNumbers: string[]): Promise<PhoneNumberEntity[]> {
        const alreadySaved = await this.phoneNumberRepository.find({
            where: { phoneNumber: In(phoneNumbers) },
        });
        const alreadySavedPhoneNumbers = alreadySaved.map((el) => el.phoneNumber);

        const phoneNumberToSave = phoneNumbers
            .filter((phoneNumber) => !alreadySavedPhoneNumbers.includes(phoneNumber))
            .map((phoneNumber) => ({ phoneNumber }));

        const newSavedPhoneNumber = await this.phoneNumberRepository.save(phoneNumberToSave);

        return newSavedPhoneNumber.concat(alreadySaved);
    }

    async register(userId: number, phoneNumbers: PhoneNumberEntity[], addressBooks: OneAddressDto[]) {
        const bridges = phoneNumbers.map((phoneNumber) => {
            const { name: phoneNickname } = addressBooks.find((el) => el.phoneNumber === phoneNumber.phoneNumber);
            return this.userHasPhoneNumberRepository.create({ phoneNumberId: phoneNumber.id, userId, phoneNickname });
        });

        await this.userHasPhoneNumberRepository.upsert(bridges, ['userId', 'phoneNumberId']);
        return await this.userHasPhoneNumberRepository.findBy({ userId });
    }

    async getAllByUserId(userId: number) {
        return await this.userHasPhoneNumberRepository.find({
            relations: { phoneNumber: true },
            where: { userId },
        });
    }

    async blockPhoneNumber(userId: number, addressBooks: OneAddressDto[]) {
        const willBeBlocked = addressBooks.map((el) => {
            return {
                userId,
                phoneNickname: el.name,
                isBlocked: true,
            };
        });

        await this.userHasPhoneNumberRepository.save(willBeBlocked);

        return true;
    }

    async unblockPhoneNumber(userId: number, addressBooks: OneAddressDto[]) {
        const willBeUnblocked = addressBooks.map((el) => {
            return {
                userId,
                phoneNickname: el.name,
                isBlocked: false,
            };
        });

        await this.userHasPhoneNumberRepository.save(willBeUnblocked);

        return true;
    }
}
