import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpException,
    HttpStatus,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateTestFlightDto } from './dto/create-test-flight.dto';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post('test-flight')
    async postTestFlight(@Body() createTestFlightDto: CreateTestFlightDto) {}

    @Get()
    getHello(): number {
        // return this.appService.getHello();
        throw new ForbiddenException();
    }
}
