import { Module } from '@nestjs/common';
import { UserController } from 'src/controllers/user.controller';
import { UserRepository } from 'src/entities/repositories/user.repository';
import { UserService } from 'src/services/user.service';
import { CustomTypeOrmModule } from 'src/settings/typeorm/custom-typeorm.module';

@Module({
  imports: [CustomTypeOrmModule.forCustomRepository([UserRepository])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
