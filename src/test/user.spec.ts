import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '@root/controllers/user.controller';
import { UserModule } from '@root/modules/user.module';
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
              entities: [path.join(__dirname, './entities/*.entity{.ts,.js}')],
              synchronize: true,
              socketPath: '/tmp/mysql.sock',
              logging: false,
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
});
