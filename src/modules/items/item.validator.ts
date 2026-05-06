import type { ValidationError } from '../../common/interfaces/validation-error.interface';

/**
 * Validates the payload for creating a new item.
 *
 * Args:
 *   payload: The raw request body to validate.
 *
 * Returns:
 *   An array of ValidationError objects. Empty when the payload is valid.
 */
export function validateCreateItem(payload: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (payload.name === undefined || payload.name === null) {
    errors.push({ field: 'name', message: 'Field "name" is required' });
  }

  if (payload.price === undefined || payload.price === null) {
    errors.push({ field: 'price', message: 'Field "price" is required' });
  } else if (typeof payload.price === 'number' && payload.price < 0) {
    errors.push({ field: 'price', message: 'Field "price" cannot be negative' });
  }

  return errors;
}

/**
 * Validates the payload for updating an existing item.
 *
 * Only fields that are present are validated. Missing fields are allowed
 * for partial updates.
 *
 * Args:
 *   payload: The raw request body to validate.
 *
 * Returns:
 *   An array of ValidationError objects. Empty when the payload is valid.
 */
export function validateUpdateItem(payload: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (
    payload.price !== undefined &&
    payload.price !== null &&
    typeof payload.price === 'number' &&
    payload.price < 0
  ) {
    errors.push({ field: 'price', message: 'Field "price" cannot be negative' });
  }

  return errors;
}
