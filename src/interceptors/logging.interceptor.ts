import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // NOTE : 요청이 들어오는 시점
    // console.log('Before...');
    const now: Date = new Date();
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const user_agent = request.get('user-agent') || '';

    const method = request.method;
    const url = request.originalUrl;
    const http = request.get('h');

    return next.handle().pipe(
      tap(() => {
        // NOTE : 응답이 나가는 시점
        const now2: Date = new Date();
        const delay = now2.getTime() - now.getTime();
        const response = context.switchToHttp().getResponse();
        const content_length = response.get('content-length');
        console.log(
          `${ip} - [${now.toISOString()}] ${method} ${url} | ${
            response.statusCode
          } - ${content_length} | ${user_agent} +${delay}ms`,
        );
      }),
    );
  }
}
