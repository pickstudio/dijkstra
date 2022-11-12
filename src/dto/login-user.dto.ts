import { PickType } from '@nestjs/swagger';
import { UserEntity } from '@root/entities/user.entity';

export class LoginOAuthUserDto extends PickType(UserEntity, ['oAuthId'] as const) {}
