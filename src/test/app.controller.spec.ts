import { Test } from '@nestjs/testing';
import { AppController } from '@root/app.controller';
import { AppModule } from '@root/app.module';
import { AppService } from '@root/app.service';
import { UserHasPhoneNumberEntity } from '@root/entities/user-has-phone-number.entity';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { UserEntity } from '@root/entities/user.entity';
import { PhoneNumberService } from '@root/services/phone-number.service';
import { In } from 'typeorm';

describe('AppController', () => {
    let Controller: AppController;
    let Service: AppService;
    let phoneNumberService: PhoneNumberService;
    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        Controller = module.get<AppController>(AppController);
        Service = module.get<AppService>(AppService);
        phoneNumberService = module.get<PhoneNumberService>(PhoneNumberService);
    });

    describe('0. 테스트 준비', () => {
        it('Controller is defined.', async () => {
            expect(Controller).toBeDefined();
        });

        it('Service is defined.', async () => {
            expect(Service).toBeDefined();
        });

        it('phoneNumberService is defined.', async () => {
            expect(phoneNumberService).toBeDefined();
        });
    });

    describe('1. service 로직들에 대한 우선 검증', () => {
        describe('1.1. appService.saveUserAndPhnoeNumbers', () => {
            let user: UserEntity;
            afterEach(async () => {
                if (user) {
                    const searchedUser = await UserEntity.findOne({
                        relations: {
                            phoneNumber: true,
                        },
                        where: { id: user.id },
                    });
                    await UserEntity.delete({ id: searchedUser.id });
                    await PhoneNumberEntity.delete({ id: searchedUser.phoneNumber.id });
                }
            });
            it('1.1.1. 유저가 생성된다.', async () => {
                user = await Service.saveUserAndPhoneNumbers({ nickName: 'nickName', phoneNumber: 'phoneNumber' });

                expect(user.email).toBe('nickName');
                expect(user.password).toBe('nickName');
                expect(user.name).toBe('nickName');

                expect(user.phoneNumber.phoneNumber).toBe('phoneNumber');
            });

            it('1.1.2. 유저의 번호를 적지 않을 경우 UNKNOWN으로 들어가게 된다.', async () => {
                user = await Service.saveUserAndPhoneNumbers({ nickName: 'nickName' });

                expect(user.email).toBe('nickName');
                expect(user.password).toBe('nickName');
                expect(user.name).toBe('nickName');

                expect(user.phoneNumber.phoneNumber).toBe('UNKNOWN');
            });
        });

        describe('1.2. phoneNumberService.saveOrIgnore', () => {
            const phoneNumbers = [];
            afterAll(async () => {
                if (phoneNumbers.length) {
                    await PhoneNumberEntity.delete({
                        phoneNumber: In(phoneNumbers),
                    });
                }
            });

            it('1.2.1. 전화번호가 저장되어야 한다.', async () => {
                const created = await phoneNumberService.saveOrIgnore(['010', '011']);

                expect(created).toBeDefined();
                expect(created).toBeInstanceOf(Array);
                expect(created.length).toBe(2);

                expect(created.at(0).phoneNumber).toBe('010');
                expect(created.at(1).phoneNumber).toBe('011');
            });

            it('1.2.2. 새로운 전화번호를 저장할 때, 이미 저장된 것이 있다면 새로 추가하지 않는다.', async () => {
                const before = await PhoneNumberEntity.count();

                const created = await phoneNumberService.saveOrIgnore(['010', '011']);
                expect(created).toBeDefined();
                expect(created).toBeInstanceOf(Array);
                expect(created.length).toBe(2);

                const after = await PhoneNumberEntity.count();

                expect(before).toBe(after);
            });
        });

        // describe('1.3. phoneNumberService.register', () => {
        //     let user: UserEntity;
        //     beforeAll(async () => {
        //         user = await UserEntity.save({
        //             name: 'name',
        //             email: 'email',
        //             birth: new Date(),
        //             password: 'password',
        //             phoneNumber: {
        //                 phoneNumber: '01085257658',
        //             },
        //         });
        //     });

        //     afterAll(async () => {
        //         try {
        //             await UserEntity.delete({ id: user.id });
        //             await PhoneNumberEntity.delete({ id: user.phoneNumber.id });
        //         } catch (err) {
        //             console.log(err.message);
        //         }
        //     });

        //     it('1.3.1. 유저의 전화번호부에 해당 전화번호들을 저장한다.', async () => {
        //         const phoneNumber = PhoneNumberEntity.create({ phoneNumber  : 'testPhoneNumber' });
        //         await phoneNumberService.register(user.id, [phoneNumber])
        //     });
        // });
    });

    describe('2. POST test-flight ( 테스트 플라이트 용 유저 및 전화번호 저장 )', () => {
        let user: UserEntity;
        afterAll(async () => {
            if (user) {
                await UserEntity.remove(user);
                if (user.phoneNumber) {
                    await PhoneNumberEntity.remove(user.phoneNumber);
                }
            }
        });

        it('2.1. 유저 정보가 저장되어야 한다.', async () => {
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

            const { phoneNickname } = await UserHasPhoneNumberEntity.findOneBy({ userId: user.id });
            expect(phoneNickname).toBe('person1');
        });

        it('2.2. 동일한 유저 정보로 저장할 경우 전화번호만 새로 추가한다.', async () => {
            user = await Controller.postTestFlight({
                nickName: 'kakasoo',
                phoneNumber: null,
                data: [],
            });

            expect(user).toBeDefined();
            expect(user.bridges.length).toBe(1);

            expect(user.bridges.at(0).phoneNickname).toBe('person1');
        });

        it('2.3. 동일한 유저 정보로 저장할 경우 전화번호만 새로 추가할 때, 전화번호가 겹치면 무시한다.', async () => {
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

            const createdUser = await UserEntity.findOne({
                relations: {
                    bridges: {
                        phoneNumber: true,
                    },
                    phoneNumber: true,
                },
                where: { id: user.id },
            });

            expect(user).toBeDefined();
            expect(user.bridges.length).toBe(2);
        });
    });
});
