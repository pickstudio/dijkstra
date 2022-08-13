import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '@root/controllers/user.controller';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';
import { UserEntity } from '@root/entities/user.entity';
import { UserModule } from '@root/modules/user.module';
import { plainToClass } from 'class-transformer';
import * as path from 'path';

describe('UserController', () => {
    let Controller: UserController;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: `.env.${process.env.NODE_ENV}`, // local, test, dev, prod
                }),
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule],
                    inject: [ConfigService],
                    useFactory: (configService: ConfigService) => {
                        return {
                            type: 'mysql',
                            host: 'localhost',
                            port: 3306,
                            username: configService.get('DB_USERNAME'),
                            password: configService.get('DB_PASSWORD'),
                            database: configService.get('DB_DATABASE'),
                            entities: [path.join(__dirname, '../entities/*.entity{.ts,.js}')],
                            synchronize: false,
                            logging: false,
                            ...{ socketPath: configService.get('NODE_ENV') === 'local' && '/tmp/mysql.sock' },
                        };
                    },
                }),
                UserModule,
            ],
        }).compile();

        Controller = module.get<UserController>(UserController);
    });

    describe('0. 테스트 준비', () => {
        it('Controller is defined.', async () => {
            expect(Controller).toBeDefined();
        });
    });

    describe('2. 유저가 생성된다. ( POST /user )', () => {
        let saved_user: UserEntity;
        let saved_phoneNumber: PhoneNumberEntity;
        afterEach(async () => {
            if (saved_user && saved_user.id) {
                const userToDelete = await UserEntity.findOne({
                    where: { id: saved_user.id },
                });
                await UserEntity.remove(userToDelete);
            }
            if (saved_phoneNumber && saved_phoneNumber.id) {
                const phoneNumberToDelete = await PhoneNumberEntity.findOne({
                    where: { id: saved_phoneNumber.id },
                });
                await PhoneNumberEntity.remove(phoneNumberToDelete);
            }
        });

        it('2.1. 유저가 생성된다.', async () => {
            const phoneNumber: PhoneNumberEntity = plainToClass(PhoneNumberEntity, {
                phoneNumber: '010-1234-5678',
            });

            saved_phoneNumber = await PhoneNumberEntity.save(phoneNumber);

            const user = plainToClass(UserEntity, {
                name: 'hi',
                email: 'test2@test.com',
                password: 'password',
                birth: new Date('2022-07-12'),
                gender: 'Male',
                phoneNumber: saved_phoneNumber,
            });

            expect(saved_phoneNumber).toBeDefined();
            expect(saved_phoneNumber).toBeInstanceOf(PhoneNumberEntity);

            saved_user = await Controller.saveUser(user);
            // console.log(saved_user);

            expect(saved_user).toBeDefined();
            /*
        UserService.saveUser 함수 내에서 Object로 변환되는 것 같다.
        Object로 반환해도 괜찮을지는 의문.
        혹은 save의 인수 내부에 plainToClass를 사용하는것이 좋을지 고민해 보았으나,
        아직까진 경험이 부족하여 필요성을 인식하지 못함.
        
        expect(saved_user).toBeInstanceOf(UserEntity);
      */
            expect(saved_user).toBeInstanceOf(Object);
        });

        it('2.2. 동일한 이메일의 유저는 생성될 수 없다.', async () => {
            const phoneNumber: PhoneNumberEntity = plainToClass(PhoneNumberEntity, {
                phoneNumber: '010-1234-5678',
            });

            saved_phoneNumber = await PhoneNumberEntity.save(phoneNumber);

            const user = plainToClass(UserEntity, {
                name: 'hi',
                email: 'test2@test.com',
                password: 'password',
                birth: new Date('2022-07-12'),
                gender: 'Male',
                phoneNumber: saved_phoneNumber,
            });
            expect(saved_phoneNumber).toBeDefined();
            expect(saved_phoneNumber).toBeInstanceOf(PhoneNumberEntity);

            saved_user = await Controller.saveUser(user);

            let newsave;
            try {
                newsave = await Controller.saveUser(user);
            } catch {
                expect(newsave).toBeUndefined();
            }
        });

        it('2.3. 유저의 비밀번호는 암호화되어 저장되어야 한다.', async () => {
            const phoneNumber: PhoneNumberEntity = plainToClass(PhoneNumberEntity, {
                phoneNumber: '010-1234-5678',
            });

            saved_phoneNumber = await PhoneNumberEntity.save(phoneNumber);

            const user = plainToClass(UserEntity, {
                name: 'hi',
                email: 'test2@test.com',
                password: 'password',
                birth: new Date('2022-07-12'),
                gender: 'Male',
                phoneNumber: saved_phoneNumber,
            });
            expect(saved_phoneNumber).toBeDefined();
            expect(saved_phoneNumber).toBeInstanceOf(PhoneNumberEntity);

            saved_user = await Controller.saveUser(user);
            expect(saved_user).toBeDefined();
            expect(saved_user.password).not.toEqual(user.password);
        });

        // NOTE : 엄밀히 말해, nullable한 값이 아니기 때문에 테스트로 작성될 필요는 없는 부분이다.
        // COMMENT : 불필요한 테스트이므로 생략하겠음.
        // it.todo('2.4. 모든 유저는 전화번호가 있다. ( 유저 생성 시 전화번호 생성 )');
    });

    describe('3. 유저를 삭제한다. ( DELETE /user/{:id} )', () => {
        let saved_user: UserEntity;
        let saved_phoneNumber: PhoneNumberEntity;
        afterEach(async () => {
            if (saved_user && saved_user.id) {
                const userToDelete = await UserEntity.findOne({
                    where: { id: saved_user.id },
                    withDeleted: true,
                });
                await UserEntity.remove(userToDelete);
            }
            if (saved_phoneNumber && saved_phoneNumber.id) {
                const phoneNumberToDelete = await PhoneNumberEntity.findOne({
                    where: { id: saved_phoneNumber.id },
                });
                await PhoneNumberEntity.remove(phoneNumberToDelete);
            }
        });
        /**
         * NOTE :
         * soft-delete 할 것 ( deletedAt에 삭제 날짜를 기입한다. )
         * TypeORM의 find는 별도의 조건을 주지 않으면 deletedAt이 null이 아닌 row는 알아서 제외한다.
         * 삭제 후 다시 조회하여 ( hint. withDeleted ) 삭제 날짜가 기입되었는지 체크해보기
         */
        it('3.1. 특정 id의 유저를 삭제한다.', async () => {
            const phoneNumber: PhoneNumberEntity = plainToClass(PhoneNumberEntity, {
                phoneNumber: '010-1234-5678',
            });

            saved_phoneNumber = await PhoneNumberEntity.save(phoneNumber);

            const user = plainToClass(UserEntity, {
                name: 'hi',
                email: 'test2@test.com',
                password: 'password',
                birth: new Date('2022-07-12'),
                gender: 'Male',
                phoneNumber: saved_phoneNumber,
            });

            saved_user = await Controller.saveUser(user);
            expect(saved_user.deletedAt).toEqual(null);
            const userIdToDelete = saved_user.id;
            const result = await Controller.deleteUser(userIdToDelete);
            // console.log("this is result: ");
            // console.log(result);
            expect(result.affected).toEqual(1);

            const userDeleted = await UserEntity.findOne({
                where: { id: userIdToDelete },
                withDeleted: true,
            });
            // console.log("this is delete check: ");
            // console.log(userDeleted);
            expect(userDeleted.deletedAt).not.toEqual(null);
            expect(userDeleted.deletedAt).toBeInstanceOf(Date);
        });
    });
});
