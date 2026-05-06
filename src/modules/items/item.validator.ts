import type { ValidationError } from '../../common/interfaces/validation-error.interface';

export function validateCreateItem(payload: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  const p = payload as Record<string, unknown>;

  if (p.name === undefined || p.name === null || p.name === '') {
    errors.push({ field: 'name', message: 'Field "name" is required' });
  }

  if (p.price === undefined || p.price === null) {
    errors.push({ field: 'price', message: 'Field "price" is required' });
  } else if (typeof p.price !== 'number') {
    errors.push({ field: 'price', message: 'Field "price" must be a number' });
  } else if (p.price < 0) {
    errors.push({ field: 'price', message: 'Field "price" cannot be negative' });
  }

  return errors;
}

export function validateUpdateItem(payload: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  const p = payload as Record<string, unknown>;

  if (p.name === undefined && p.price === undefined) {
    errors.push({ field: 'body', message: 'At least one field must be provided' });
    return errors;
  }

  if (p.price !== undefined && p.price !== null) {
    if (typeof p.price !== 'number') {
      errors.push({ field: 'price', message: 'Field "price" must be a number' });
    } else if (p.price < 0) {
      errors.push({ field: 'price', message: 'Field "price" cannot be negative' });
    }
  }

  return errors;
}
