import { IsInt } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NumberRange } from '@root/decorators/number-range.decorator';

export class CommonGetPageParamDto {
  @ApiProperty({})
  @IsInt()
  page: number;

  @ApiProperty({})
  @NumberRange(1, 100)
  limit: number;

  toPageOption = () => {
    return {
      skip: (this.page - 1) * this.limit,
      take: this.limit,
    };
  };
}
