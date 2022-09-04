import { Body, Controller, ForbiddenException, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { OneAddressDto } from './dto/address-book.dto';
import { CreateTestFlightDto } from './dto/create-test-flight.dto';
import { PhoneNumberService } from './services/phone-number.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService, private readonly phoneNumberService: PhoneNumberService) {}

    @Post('test-flight')
    async postTestFlight(@Body() createTestFlightDto: CreateTestFlightDto) {
        console.log(createTestFlightDto);
        const user = await this.appService.saveUserAndPhoneNumbers({
            nickName: createTestFlightDto.nickName,
            phoneNumber: createTestFlightDto.phoneNumber,
        });
        const phoneNumbers = createTestFlightDto.data.map((el) => el.phoneNumber.replaceAll('-', ''));
        const phoneNumbersToSave = await this.phoneNumberService.saveOrIgnore(phoneNumbers);
        const addresses = createTestFlightDto.data.map((el) => {
            return new OneAddressDto({ name: el.name, phoneNumber: el.phoneNumber.replaceAll('-', '') });
        });

        console.log(phoneNumbersToSave, addresses);
        await this.phoneNumberService.register(user.id, phoneNumbersToSave, addresses);
        user.bridges = await this.phoneNumberService.getAllByUserId(user.id);

        return user;
    }

    @Get()
    getHello(): number {
        // return this.appService.getHello();
        throw new ForbiddenException();
    }
}
