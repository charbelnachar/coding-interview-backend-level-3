import type { NextFunction, Request, Response } from 'express';
import { NotFoundException } from '../exceptions/not-found.exception';
import { ValidationException } from '../exceptions/validation.exception';

/**
 * Express error-handling middleware that maps domain exceptions to HTTP
 * responses.
 *
 * - ValidationException -> 400 with { errors }
 * - NotFoundException   -> 404 with { message }
 * - Anything else       -> 500 with { message: "Internal Server Error" }
 *
 * Args:
 *   err: The thrown error or rejected value passed via next(err).
 *   _req: The incoming request (unused).
 *   res: The outgoing response.
 *   _next: The next function (unused once a response is sent).
 */
export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ValidationException) {
    res.status(err.statusCode).json({ errors: err.errors });
    return;
  }

  if (err instanceof NotFoundException) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
}
