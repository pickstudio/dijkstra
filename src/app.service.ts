import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '@root/entities/repositories/user.repository';

@Injectable()
export class AppService {
    constructor(@InjectRepository(UserRepository) private readonly userRepository: UserRepository) {}
    async saveUserAndPhoneNumbers({ nickName, phoneNumber }: { nickName: string; phoneNumber?: string }) {
        let savedUser = await this.userRepository.findOne({
            where: {
                email: nickName,
                password: nickName,
                name: nickName,
            },
            relations: {
                bridges: true,
            },
        });

        if (!savedUser) {
            savedUser = await this.userRepository.save({
                email: nickName,
                password: nickName,
                name: nickName,
                birth: new Date(),
                phoneNumber: {
                    phoneNumber: phoneNumber ? phoneNumber : 'UNKNOWN',
                },
            });
        }

        return savedUser;
    }

    getHello(): string {
        return 'Hello World!';
    }
}
