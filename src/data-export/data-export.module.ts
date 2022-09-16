import { Module } from '@nestjs/common';
import { UserHasPhoneNumberRepository } from '@root/entities/repositories/address-book.repository';
import { UserRepository } from '@root/entities/repositories/user.repository';
import { CustomTypeOrmModule } from '@root/settings/typeorm/custom-typeorm.module';
import { DataController } from './data-export.controller';
import { DataService } from './data-export.service';
import { DataExportJwtStrategy } from './data-export.strategy';

@Module({
    imports: [CustomTypeOrmModule.forCustomRepository([UserRepository, UserHasPhoneNumberRepository])],
    controllers: [DataController],
    providers: [DataService, DataExportJwtStrategy],
})
export class DataModule {}
