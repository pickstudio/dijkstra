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
              entities: [path.join(__dirname, '../entities/*.entity{.ts,.js}')],
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

  describe('1. 유저가 조회된다. ( GET /user )', () => {
    it('1.1. 모든 유저를 조회한다.', async () => {
      const user = await Controller.getUser();

      expect(user).toBeDefined();
      expect(user).toBeInstanceOf(Array);
    });
  });

  describe('2. 유저가 생성된다. ( POST /user )', () => {
    it.todo('2.1. 유저가 생성된다.');
    it.todo('2.2. 동일한 이메일의 유저는 생성될 수 없다.');
    it.todo('2.3. 유저의 비밀번호는 암호화되어 저장되어야 한다.');

    // NOTE : 엄밀히 말해, nullable한 값이 아니기 때문에 테스트로 작성될 필요는 없는 부분이다.
    it.todo('2.4. 모든 유저는 전화번호가 있다. ( 유저 생성 시 전화번호 생성 )');
  });

  describe('3. 유저를 삭제한다. ( DELETE /user/{:id} )', () => {
    /**
     * NOTE :
     * soft-delete 할 것 ( deletedAt에 삭제 날짜를 기입한다. )
     * TypeORM의 find는 별도의 조건을 주지 않으면 deletedAt이 null이 아닌 row는 알아서 제외한다.
     * 삭제 후 다시 조회하여 ( hint. withDeleted ) 삭제 날짜가 기입되었는지 체크해보기
     */
    it.todo('3.1. 특정 id의 유저를 삭제한다.');
  });
});
