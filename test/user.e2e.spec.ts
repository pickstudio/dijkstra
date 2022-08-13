import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UserModule } from '@root/modules/user.module';
import { UserService } from '@root/services/user.service';
import { AuthModule } from '@root/auth/auth.module';
import { AuthController } from '@root/auth/auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { AppService } from '@root/app.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '@root/filters/http-exception.filter';
import { LoggingInterceptor } from '@root/interceptors/logging.interceptor';
import { TransformInterceptor } from '@root/interceptors/transform.interceptor';
import { classToPlain } from 'class-transformer';

describe('User', () => {
    let app: INestApplication;
    let authController: AuthController;
    let userService: UserService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                UserModule,
                AuthModule,
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
                            socketPath: '/tmp/mysql.sock',
                            logging: false,
                        };
                    },
                }),
            ],
            providers: [
                AppService,
                {
                    provide: APP_FILTER,
                    useClass: HttpExceptionFilter,
                },
                {
                    provide: APP_INTERCEPTOR,
                    useClass: LoggingInterceptor,
                },
                {
                    provide: APP_INTERCEPTOR,
                    useClass: TransformInterceptor,
                },
            ],
        })
            .overrideProvider(UserService)
            .useValue(userService)
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
        authController = moduleRef.get<AuthController>(AuthController);
        userService = moduleRef.get<UserService>(UserService);
    });

    describe('0. auth/login', () => {});
    it(`/POST auth/login`, async () => {
        const id = 29;
        const user = await classToPlain(userService.getOneUser(id));
        return request(app.getHttpServer())
            .get(`/user/${id}`)
            .expect(200)
            .expect(
                JSON.stringify({
                    data: user,
                    query: {},
                    statusCode: 200,
                }),
            );
    });

    afterAll(async () => {
        await app.close();
    });
});
