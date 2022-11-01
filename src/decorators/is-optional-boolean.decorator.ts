import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

const optionalBooleanMapper = new Map([
    ['undefined', undefined],
    ['true', true],
    ['false', false],
]);

export const ParseOptionalBoolean = () =>
    Transform((params) => {
        const value = params.obj[params.key];
        return optionalBooleanMapper.get(String(value));
    });

export function IsOptionalBoolean() {
    return applyDecorators(IsOptional(), ParseOptionalBoolean(), IsBoolean());
}
