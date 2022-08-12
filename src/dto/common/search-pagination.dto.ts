import { IsInt } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NumberRange } from '@root/decorators/number-range.decorator';

export class SearchPaginationDto {
    @ApiProperty({ description: '페이지' })
    @IsInt()
    page: number;

    @ApiProperty({ description: '한 페이지 당 조회하고자 하는 페이지의 수' })
    @NumberRange(1, 100)
    take: number;
}
