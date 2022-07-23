import { IsInt } from "@nestjs/class-validator";
import { Column, Entity, PrimaryColumn, Unique } from "typeorm";
import { PhoneNumberEntity } from "./phone-number.entity";

@Entity()
// @Unique(['userId', 'phoneNumberId'])
export class UserHasPhoneNumberEntity {
    @IsInt()
    @PrimaryColumn()
    userId: number;

    @IsInt()
    @PrimaryColumn()
    phoneNumberId: number
}