import type { ValidationError } from '../interfaces/validation-error.interface';

export class ValidationException extends Error {
  public readonly errors: ValidationError[];
  public readonly statusCode: number = 400;

  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.errors = errors;
    this.name = 'ValidationException';
  }
}
