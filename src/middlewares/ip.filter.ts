import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class IpFilter implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        let allowIps: string[] = [];
        const request = context.switchToHttp().getRequest();

        if (process.env.NODE_ENV == 'local') {
            allowIps = ['127.0.0.1', '211.221.230.61'];
        }

        if (!allowIps.includes(request.ip)) {
            throw new UnauthorizedException('invalid ip');
        }
        return next.handle().pipe();
    }
}
