import { IsInt } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NumberRange } from '@root/decorators/number-range.decorator';

export class PageParamDto {
  @ApiProperty({})
  @IsInt()
  page: number;

  @ApiProperty({})
  @NumberRange(1, 100)
  take: number;
}
