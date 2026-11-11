import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { AuthUser } from '../auth/guards/jwt-auth.guard';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest<Request & { user?: AuthUser }>();
    const response = http.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body =
      exception instanceof HttpException
        ? exception.getResponse()
        : { statusCode, message: 'Internal server error' };

    const entry = {
      message: 'Request failed',
      method: request.method,
      path: request.originalUrl.split('?')[0],
      statusCode,
      userId: request.user?.id,
      error: this.errorMessage(exception, body),
    };

    if (statusCode >= 500) {
      this.logger.error({
        ...entry,
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    } else {
      this.logger.warn(entry);
    }

    response.status(statusCode).json(body);
  }

  private errorMessage(exception: unknown, body: string | object): string {
    if (!(exception instanceof HttpException)) {
      return exception instanceof Error ? exception.message : String(exception);
    }

    const message =
      typeof body === 'object' && 'message' in body ? body.message : undefined;

    if (Array.isArray(message)) {
      return message.join('; ');
    }
    if (typeof message === 'string') {
      return message;
    }
    return exception.message;
  }
}
