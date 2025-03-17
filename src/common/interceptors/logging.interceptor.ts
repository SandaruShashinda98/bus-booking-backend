import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import {
  LOG_REQUEST_KEY,
  LOG_RESPONSE_KEY,
} from '../decorators/log-request-response.decorator';
import { WinstonLogger } from '@common/logger/winston-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: WinstonLogger,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const now = Date.now();
    const shouldLogRequest = this.reflector.getAllAndOverride<{
      enabled: boolean;
      customText?: string;
    }>(LOG_REQUEST_KEY, [context.getHandler(), context.getClass()]);

    const shouldLogResponse = this.reflector.getAllAndOverride<{
      enabled: boolean;
      customText?: string;
    }>(LOG_RESPONSE_KEY, [context.getHandler(), context.getClass()]);

    // for request logging
    if (shouldLogRequest?.enabled) {
      const customText = shouldLogRequest.customText
        ? `${shouldLogRequest.customText} ->`
        : '';

      if (user?._id) {
        this.logger.verbose(
          `UserId:${user._id} Username:${user?.username} ${customText} Request: ${method} ${url}`,
          'HttpRequest',
        );
        this.logger.verbose(
          `UserId:${user._id} Username:${user?.username} ${customText} Request Body: ${JSON.stringify(request.body)}`,
          'HttpRequest',
        );
      } else {
        this.logger.verbose(
          `UserId: None Username: None ${customText} Request: ${method} ${url}`,
          'HttpRequest',
        );
      }
    }

    return next.handle().pipe(
      tap((data) => {
        // for response logging
        if (shouldLogResponse?.enabled) {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          const customText = shouldLogResponse.customText
            ? `${shouldLogResponse.customText} ->`
            : '';

          this.logger.verbose(
            `${customText} Response: ${method} ${url} ${response.statusCode} ${delay}ms`,
            'HttpResponse',
          );
          this.logger.verbose(
            `${customText} Response Body: ${JSON.stringify(data)}`,
            'HttpResponse',
          );
        }
      }),
    );
  }
}
