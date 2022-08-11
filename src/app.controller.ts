import {
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

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): number {
        // return this.appService.getHello();
        throw new ForbiddenException();
    }
}
