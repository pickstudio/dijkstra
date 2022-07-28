import { IsInt, Max, Min } from '@nestjs/class-validator';
import { applyDecorators } from '@nestjs/common';

export function NumberRange(min, max) {
  return applyDecorators(IsInt(), Min(min), Max(max));
}
