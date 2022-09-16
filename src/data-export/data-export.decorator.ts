import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DataExportJwtGuard } from './data-export.guard';

export function DataExportAuth() {
    return applyDecorators(ApiBearerAuth('Bearer'), UseGuards(DataExportJwtGuard));
}
