import { Module } from '@nestjs/common';
import { UserController } from '@root/controllers/user.controller';
import { UserHasPhoneNumberRepository } from '@root/entities/repositories/address-book.repository';
import { UserRepository } from '@root/entities/repositories/user.repository';
import { UserService } from '@root/services/user.service';
import { CustomTypeOrmModule } from '@root/settings/typeorm/custom-typeorm.module';

@Module({
  imports: [
    CustomTypeOrmModule.forCustomRepository([
      UserRepository,
      UserHasPhoneNumberRepository,
    ]),
  ],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
