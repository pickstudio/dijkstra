import { Body, Controller, ForbiddenException, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { OneAddressDto } from './dto/address-book.dto';
import { CreateTestFlightDto } from './dto/create-test-flight.dto';
import { UserEntity } from './entities/user.entity';
import { PhoneNumberService } from './services/phone-number.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService, private readonly phoneNumberService: PhoneNumberService) {}

    @Post('test-flight')
    async postTestFlight(@Body() createTestFlightDto: CreateTestFlightDto) {
        const user = await this.appService.saveUserAndPhoneNumbers(createTestFlightDto);
        console.log(user);

        const phoneNumbers = createTestFlightDto.data.map((el) => el.phoneNumber);
        const phoneNumbersToSave = await this.phoneNumberService.saveOrIgnore(phoneNumbers);
        const addresses = createTestFlightDto.data.map((el) => {
            return new OneAddressDto({ name: el.name, phoneNumber: el.phoneNumber });
        });

        await this.phoneNumberService.register(user.id, phoneNumbersToSave, addresses);
        user.bridges = await this.phoneNumberService.getAllByUserId(user.id);

        console.log(
            await UserEntity.findOne({
                relations: {
                    bridges: true,
                },
                where: { id: user.id },
            }),
            'bridges',
        );
        return user;
    }

    @Get()
    getHello(): number {
        // return this.appService.getHello();
        throw new ForbiddenException();
    }
}
