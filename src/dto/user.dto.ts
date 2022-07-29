import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { UserEntity } from '@root/entities/user.entity';

export class CreateUserDto extends PickType(UserEntity, [
  'email',
  'name',
  'birth',
  'password',
  'phoneNumber',
  'gender',
] as const) {}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email'] as const),
) {}
