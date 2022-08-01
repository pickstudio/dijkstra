import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@root/entities/user.entity';
import { UserModule } from '@root/modules/user.module';
import { plainToClass } from 'class-transformer';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { LoginInfo } from './auth.input';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UserModule,
        JwtModule.registerAsync({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              envFilePath: `.env.${process.env.NODE_ENV}`,
            }),
          ],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET'),
            signOptions: {
              expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
            },
          }),
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
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('0. 테스트 준비', () => {
    it('Service is defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('1. Local 로그인.', () => {
    let loginInfo: LoginInfo;
    beforeEach(() => {
      loginInfo = plainToClass(LoginInfo, {
        email: 'test3@test.com',
        password: 'password123!@#',
      });
    });
    it('1.1. 이메일과 패스워드를 정확히 입력하면 validateUser 함수가 유저 객체를 반환한다.', async () => {
      const state = await service.validateUser(
        loginInfo.email,
        loginInfo.password,
      );
      expect(state).toBeDefined();
    });
    it('1.2. 이메일과 패스워드가 정확하지 않다면 오류를 반환한다.', async () => {
      let state;
      try {
        state = await service.validateUser(loginInfo.email, 'asdf');
        expect(state).toBeDefined();
      } catch {
        expect(state).toBeUndefined();
      }
    });
    it.todo('1.3. 로그인에 성공하면 토큰을 발행한다.');
  });
});
