import { IsString } from "@nestjs/class-validator"
import { PhoneNumberEntity } from "@root/entities/phone-number.entity";
import { OneToOne } from "typeorm";


export class AddressBookDto {
    @IsString({each: true})
    addressBook: string[];
}