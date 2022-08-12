import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PhoneNumberRepository } from '@root/entities/repositories/phone-number.repository';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { In } from 'typeorm';
import { UserHasPhoneNumberRepository } from '@root/entities/repositories/address-book.repository';
import { OneAddressDto } from '@root/dto/address-book.dto';

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

        await this.userHasPhoneNumberRepository
            .createQueryBuilder('bridge')
            .insert()
            .values(bridges)
            .orIgnore()
            .execute();
    }
}
