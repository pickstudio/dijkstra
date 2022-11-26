import { IsIn, IsNotEmpty, IsString } from '@nestjs/class-validator';
import { applyDecorators } from '@nestjs/common';

export function IsGender() {
    return applyDecorators(IsNotEmpty(), IsString(), IsIn(['male', 'female']));
}
