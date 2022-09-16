import { Controller, Get, UseGuards } from '@nestjs/common';
import { DataExportAuth } from './data-export.decorator';
import { DataService } from './data-export.service';

@Controller('data')
export class DataController {
    constructor(private readonly dataService: DataService) {}

    @DataExportAuth()
    @Get('')
    async getData() {
        return await this.dataService.getData();
    }
}
