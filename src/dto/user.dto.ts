import { IsDate, IsEmail, IsString } from "@nestjs/class-validator";
import { PickType } from "@nestjs/swagger";
import { UserEntity } from "@root/entities/user.entity";

export class CreateUserDto extends PickType(UserEntity, ['email', 'name', 'birth', 'password', 'phoneNumber'] as const){}