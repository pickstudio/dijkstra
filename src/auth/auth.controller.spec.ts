import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@root/modules/user.module';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import * as path from 'path';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRepository } from '@root/entities/repositories/user.repository';
import { LoginInfo } from './auth.input';
import { plainToClass } from 'class-transformer';

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
                            synchronize: true,
                            socketPath: '/tmp/mysql.sock',
                            logging: false,
                        };
                    },
                }),
                PassportModule,
                JwtModule.registerAsync({
                    imports: [ConfigModule],
                    inject: [ConfigService],
                    useFactory: async (configService: ConfigService) => ({
                        secret: configService.get('JWT_SECRET'),
                        signOptions: {
                            expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
                        },
                    }),
                }),
                AuthModule,
                UserModule,
            ],
            providers: [AuthService, LocalStrategy, JwtStrategy, UserRepository, JwtService],
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

    describe('1. Local 로그인.', () => {
        let loginInfo: LoginInfo;
        let wrongInfo: LoginInfo;
        beforeEach(() => {
            loginInfo = plainToClass(LoginInfo, {
                email: 'test3@test.com',
                password: 'password123!@#',
            });
            wrongInfo = plainToClass(LoginInfo, {
                email: 'test3@test.com',
                password: 'pass',
            });
        });

        it('1.1. 일반적인 로그인 시도.', async () => {
            const { email, password } = loginInfo;
            const userEntity = await service.validateUser(email, password);
            const state = await controller.login(userEntity);
            expect(state).toBeDefined();
            const decoded = jwtService.decode(state.access_token);
            expect(decoded['username']).toBeDefined();
            expect(decoded['sub']).toBeDefined();
        });

        it('1.2. 로그인 실패', async () => {
            const { email, password } = wrongInfo;
            const userEntity = await service.validateUser(email, password);
            const state = await controller.login(userEntity);
            const decoded = jwtService.decode(state.access_token).valueOf();
            expect(decoded['username']).toEqual('UnauthorizedException');
            expect(decoded['sub']).toBeUndefined();
        });
    });
});
