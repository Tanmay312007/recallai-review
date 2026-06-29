/**
 * RequestIdMiddleware (Vol V §5.2).
 *
 * Generates a UUID v4 per request and attaches it to `req.id` so the global
 * exception filter, logger, and interceptors can correlate logs with a single
 * request across the service boundary.
 *
 * Also sets the `X-Request-Id` response header so the client can relay it
 * to support if something goes wrong.
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    // Honor an upstream request ID if present (e.g. from API Gateway).
    const upstreamId = req.headers['x-request-id'];
    const id = typeof upstreamId === 'string' && upstreamId.length > 0
      ? upstreamId
      : randomUUID();

    // Cast to allow `req.id` access in the exception filter without `any`.
    (req as Request & { id: string }).id = id;
    _res.setHeader('X-Request-Id', id);
    next();
  }
}
