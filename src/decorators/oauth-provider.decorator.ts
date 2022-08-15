import { IsIn, IsString } from '@nestjs/class-validator';
import { applyDecorators } from '@nestjs/common';

export function IsProvider() {
  return applyDecorators(IsString(), IsIn(['local','kakao']));
}
