import { IsIn, IsNotEmpty, IsString } from '@nestjs/class-validator';
import { applyDecorators } from '@nestjs/common';

export function IsEducation() {
    return applyDecorators(
        IsNotEmpty(),
        IsString(),
        IsIn(['beginner', 'middle', 'high', 'colleage', 'master', 'doctor']),
    );
}
