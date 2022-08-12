import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PhoneNumberRepository } from '@root/entities/repositories/phone-number.repository';

@Injectable()
export class PhoneNumberService {
    constructor(
        @InjectRepository(PhoneNumberRepository) private readonly phoneNumberRepository: PhoneNumberRepository,
    ) {}
}
