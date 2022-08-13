import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { AppController } from '@root/app.controller';
import { AppService } from '@root/app.service';
import { AuthModule } from '@root/auth/auth.module';
import { HttpExceptionFilter } from '@root/filters/http-exception.filter';
import { LoggingInterceptor } from '@root/interceptors/logging.interceptor';
import { TransformInterceptor } from '@root/interceptors/transform.interceptor';

import { UserModule } from '@root/modules/user.module';

@Module({
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
                    host: configService.get('DB_HOST') || 'localhost',
                    port: Number(configService.get('DB_PORT')) || 3306,
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_DATABASE'),
                    entities: [path.join(__dirname, './entities/*.entity{.ts,.js}')],
                    synchronize: true,
                    socketPath: '/tmp/mysql.sock',
                    logging: true,
                };
            },
        }),
        UserModule,
        AuthModule,
    ],
    controllers: [AppController],
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
export class AppModule {}
