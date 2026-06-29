/**
 * ZodValidationPipe — bridges @recallai/shared Zod schemas into NestJS DI.
 *
 * PROMPT §9 mandates "reject unknown fields" on every endpoint. The shared
 * schemas already enforce this via `.strict()`; this pipe is the single place
 * the API runs them so request validation can never drift from the rules in
 * `@recallai/shared`. Reused by every module (auth, decks, cards, review …).
 *
 * On failure it throws a 400 with the standard `{ error: { code, message } }`
 * envelope (the GlobalExceptionFilter maps BadRequestException → AUTH_001).
 */
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodError, type ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe<TSchema extends ZodSchema>
  implements PipeTransform
{
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        // Flatten field issues into a single human-readable message. The
        // GlobalExceptionFilter strips this in production (disableErrorMessages).
        const message = error.issues
          .map((issue) => {
            const path = issue.path.join('.');
            return path ? `${path}: ${issue.message}` : issue.message;
          })
          .join('; ');
        throw new BadRequestException(message);
      }
      throw error;
    }
  }
}
