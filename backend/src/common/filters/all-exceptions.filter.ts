import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/** Numeric form of 500, so comparisons stay between plain numbers. */
const SERVER_ERROR_THRESHOLD: number = HttpStatus.INTERNAL_SERVER_ERROR;

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

/**
 * Normalizes every unhandled error into a single response shape, so clients
 * never receive a stack trace or an HTML error page.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    const status: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ErrorResponseBody = {
      statusCode: status,
      ...this.describe(exception, status),
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (status >= SERVER_ERROR_THRESHOLD) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(body);
  }

  private describe(
    exception: unknown,
    status: number,
  ): Pick<ErrorResponseBody, 'message' | 'error'> {
    if (!(exception instanceof HttpException)) {
      return {
        message: 'Internal server error',
        error: 'Internal Server Error',
      };
    }

    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { message: payload, error: exception.name };
    }

    const { message, error } = payload as {
      message?: string | string[];
      error?: string;
    };

    return {
      message: message ?? exception.message,
      error: error ?? HttpStatus[status] ?? exception.name,
    };
  }
}
