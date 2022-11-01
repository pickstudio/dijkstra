import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ description: 'email', example: 'test3@test.com' })
    email: string;

    @ApiProperty({ description: 'password', example: 'password123!@#' })
    password: string;
}
