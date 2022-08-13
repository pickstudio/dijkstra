import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@root/modules/user.module';
import { accessSync } from 'fs';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { UserRepository } from '@root/entities/repositories/user.repository';

@Module({
    imports: [
        UserModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const secret = configService.get('JWT_SECRET');
                const expriresIn = configService.get('JWT_EXPIRATION_TIME');
                return {
                    secret,
                    signOptions: {
                        expiresIn: expriresIn ? `${expriresIn}s` : '1y',
                    },
                };
            },
        }),
    ],
    exports: [AuthService],
    providers: [AuthService, LocalStrategy, JwtStrategy, KakaoStrategy, UserRepository],
    controllers: [AuthController],
})
export class AuthModule {}
