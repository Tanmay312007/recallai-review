/**
 * GlobalExceptionFilter (PROMPT §10, Vol V §5.3).
 *
 * Catches every unhandled exception in the API and maps it to the
 * standard `{ error: { code, message } }` envelope. Rules:
 *   1. Classifies HttpException → known error code + human message.
 *   2. Maps 5xx to INTERNAL_001 (never exposes stack traces to clients).
 *   3. Logs all 5xx errors at ERROR level with the request ID for tracing.
 *   4. Maps non-HTTP exceptions (programming errors) to 500 INTERNAL_001.
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '@recallai/shared';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, code, message } = this.classifyException(exception);
    const requestId = (request as Request & { id?: string }).id ?? 'unknown';

    // Log 5xx errors for Datadog / Sentry (Vol V §15).
    // Stack traces are only logged server-side — never sent to the client.
    if (status >= 500) {
      this.logger.error(
        {
          requestId,
          code,
          message,
          path: request.url,
          method: request.method,
          exception,
        },
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      error: { code, message, requestId },
    });
  }

  private classifyException(exception: unknown): {
    status: number;
    code: string;
    message: string;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      // NestJS ValidationPipe errors have a structured `message: string[]`.
      const httpMessage =
        typeof response === 'object' && response !== null && 'message' in response
          ? (response as Record<string, unknown>).message
          : exception.message;

      const message = Array.isArray(httpMessage)
        ? httpMessage.join('; ')
        : String(httpMessage ?? 'Request validation failed');

      return {
        status,
        code: this.httpStatusToCode(status),
        message,
      };
    }

    // Non-HTTP exception = programming error / unexpected failure.
    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    this.logger.error('Unexpected exception', exception);

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_001,
      // In production, never leak internal details to the client (§15).
      message: process.env['NODE_ENV'] === 'production'
        ? 'An unexpected error occurred'
        : message,
    };
  }

  /**
   * Map common HTTP status codes to the PROMPT §10 error taxonomy.
   * Unmapped codes fall back to a generic classification.
   */
  private httpStatusToCode(status: number): string {
    const map: Partial<Record<number, string>> = {
      [HttpStatus.UNAUTHORIZED]: ErrorCode.AUTH_004,
      [HttpStatus.FORBIDDEN]: ErrorCode.AUTH_005,
      [HttpStatus.NOT_FOUND]: ErrorCode.AUTH_005,
      [HttpStatus.CONFLICT]: ErrorCode.AUTH_006,
      [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.RATE_LIMIT_001,
      [HttpStatus.PAYLOAD_TOO_LARGE]: ErrorCode.DOC_002,
      [HttpStatus.UNPROCESSABLE_ENTITY]: ErrorCode.USER_001,
      [HttpStatus.BAD_REQUEST]: ErrorCode.AUTH_001,
    };
    return map[status] ?? ErrorCode.INTERNAL_001;
  }
}
