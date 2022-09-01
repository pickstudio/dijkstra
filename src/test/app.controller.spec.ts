import { Test } from '@nestjs/testing';
import { AppController } from '@root/app.controller';
import { AppModule } from '@root/app.module';
import { UserHasPhoneNumberEntity } from '@root/entities/address-book.entity';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { UserEntity } from '@root/entities/user.entity';

describe('AppController', () => {
    let Controller: AppController;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        Controller = module.get<AppController>(AppController);
    });

    describe('0. 테스트 준비', () => {
        it('Controller is defined.', async () => {
            expect(Controller).toBeDefined();
        });
    });

    describe('1. POST test-flight ( 테스트 플라이트 용 유저 및 전화번호 저장 )', () => {
        let user: UserEntity;
        afterAll(async () => {
            if (user) {
                await UserEntity.remove(user);
            }
        });

        it('1.1. 유저 정보가 저장되어야 한다.', async () => {
            user = await Controller.postTestFlight({
                nickName: 'kakasoo',
                phoneNumber: null,
                data: [
                    {
                        name: 'person1',
                        type: null,
                        phoneNumber: '010',
                    },
                ],
            });

            expect(user).toBeDefined();
            expect(user.bridges.length).toBe(1);
            expect(user.bridges.at(0).phoneNickname).toBe('person1');

            const { phoneNumber } = await PhoneNumberEntity.findOneBy({ id: user.bridges.at(0).phoneNumberId });
            expect(phoneNumber).toBe('010');
        });

        it('1.2. 동일한 유저 정보로 저장할 경우 전화번호만 새로 추가한다.', async () => {
            user = await Controller.postTestFlight({
                nickName: 'kakasoo',
                phoneNumber: null,
                data: [
                    // {
                    //     name: 'person2',
                    //     type: null,
                    //     phoneNumber: '011',
                    // },
                ],
            });

            expect(user).toBeDefined();
            expect(user.bridges.length).toBe(1);

            expect(user.bridges.at(0).phoneNickname).toBe('person1');
            console.log(user.bridges);
        });

        it.skip('1.3. 동일한 유저 정보로 저장할 경우 전화번호만 새로 추가할 때, 전화번호가 겹치면 무시한다.', async () => {
            user = await Controller.postTestFlight({
                nickName: 'kakasoo',
                phoneNumber: null,
                data: [
                    {
                        name: 'person1',
                        type: null,
                        phoneNumber: '011',
                    },
                ],
            });

            expect(user).toBeDefined();
            expect(user.bridges.length).toBe(2);
        });
    });
});
