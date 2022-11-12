import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from '../auth/auth.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '@root/entities/user.entity';

import * as bcrypt from 'bcrypt';
import * as path from 'path';
import { PhoneNumberEntity } from '@root/entities/phone-number.entity';

import { faker } from '@faker-js/faker';

describe('AuthController', () => {
    let controller: AuthController;
    let service: AuthService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: `.env.${process.env.NODE_ENV}`,
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
                            retryAttempts: 1,
                            ...{ socketPath: configService.get('NODE_ENV') === 'local' && '/tmp/mysql.sock' },
                        };
                    },
                }),
                AuthModule,
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
    });
    describe('0. 테스트 준비', () => {
        it('should be defined', () => {
            expect(controller).toBeDefined();
        });
    });

    describe('1. POST auth/login', () => {
        const email = 'test@test.com';
        const password = 'password123!@#';
        const wrongPassword = 'wrongPassword123!@#';

        let user: UserEntity;

        beforeAll(async () => {
            const createdUser = await UserEntity.findOne({ where: { email: 'test@test.com' } });
            if (createdUser) {
                await UserEntity.remove(createdUser);
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            user = await UserEntity.save({
                email,
                password: hashedPassword,
                name: 'kakasoo',
                birth: new Date(1997, 11, 6),
                phoneNumber: {
                    phoneNumber: '010-xxxx-xxxx',
                },
            });
        });

        afterAll(async () => {
            if (user && user instanceof UserEntity) {
                if (user.phoneNumber) {
                    await PhoneNumberEntity.remove(user.phoneNumber);
                }

                await UserEntity.remove(user);
            }
        });

        it('1.1. 유저 검증 시 유저가 존재할 경우 비밀번호를 제외한 유저를 반환한다.', async () => {
            const validateUser = await service.validateUser(email, password);

            expect(validateUser).toBeDefined();
            expect(validateUser.email).toBe(email);
            expect(validateUser.password).toBeUndefined();
        });

        it('1.2. 로그인에 성공해야 한다.', async () => {
            const state = await controller.login(user);
            const decoded = jwtService.decode(state) as { username: string; userId: number };

            expect(state).toBeDefined();
            expect(decoded.username).toBeDefined();
            expect(decoded.userId).toBeDefined();
        });
    });

    describe('2. POST kakao/sign-up : 카카오를 이용한 회원가입', () => {
        const kakaoUser = {
            name: faker.name.firstName(),
            oAuthId: faker.random.numeric(10),
            email: faker.internet.email(),
            gender: 'Male',
        };

        it('가입한 적 없는 유저일 경우, 유저를 생성한다.', async () => {
            try {
                console.log(kakaoUser);

                expect(kakaoUser).toBeDefined();
            } catch (err) {
                expect(err).toBeUndefined();
            } finally {
            }
        });

        it('이미 가입한 유저일 경우에는 에러를 반환한다.', async () => {});
    });

    describe('2. GET auth/kakao/login : kakao를 이용한 로그인', () => {
        it('가입한 적 있는 유저의 로그인 시, provider와 pushToken으로 유저를 찾아 반환한다.', async () => {});
        it('로그인 시 받은, 유저의 pushToken을 기록한다.', async () => {});
    });
});
