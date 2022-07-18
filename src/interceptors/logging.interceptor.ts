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
    console.log('Before...');
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        // NOTE : 응답이 나가는 시점
        console.log(`After... ${Date.now() - now}ms`);
      }),
    );
  }
}
