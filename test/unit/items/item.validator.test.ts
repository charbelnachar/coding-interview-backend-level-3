import { validateCreateItem, validateUpdateItem } from '../../../src/modules/items/item.validator';

describe('validateCreateItem', () => {
  describe('valid payloads', () => {
    it.each([[{ name: 'Test', price: 10 }], [{ name: 'Free Item', price: 0 }]])(
      'should return no errors for %j',
      (input) => {
        expect(validateCreateItem(input)).toEqual([]);
      },
    );
  });

  describe('name validation', () => {
    it('should return error when name is missing', () => {
      expect(validateCreateItem({ price: 10 })).toEqual([
        { field: 'name', message: 'Field "name" is required' },
      ]);
    });

    it('should return error when name is empty string', () => {
      expect(validateCreateItem({ name: '', price: 10 })).toEqual([
        { field: 'name', message: 'Field "name" is required' },
      ]);
    });
  });

  describe('price validation', () => {
    it('should return error when price is missing', () => {
      expect(validateCreateItem({ name: 'Test' })).toEqual([
        { field: 'price', message: 'Field "price" is required' },
      ]);
    });

    it('should return error when price is null', () => {
      expect(validateCreateItem({ name: 'Test', price: null })).toEqual([
        { field: 'price', message: 'Field "price" is required' },
      ]);
    });

    it('should return error when price is not a number', () => {
      expect(validateCreateItem({ name: 'Test', price: 'abc' })).toEqual([
        { field: 'price', message: 'Field "price" must be a number' },
      ]);
    });

    it('should return error when price is negative', () => {
      expect(validateCreateItem({ name: 'Test', price: -5 })).toEqual([
        { field: 'price', message: 'Field "price" cannot be negative' },
      ]);
    });
  });

  describe('multiple errors', () => {
    it('should return two errors when both name and price are missing', () => {
      expect(validateCreateItem({})).toHaveLength(2);
    });
  });
});

describe('validateUpdateItem', () => {
  describe('valid payloads', () => {
    it.each([[{ name: 'Updated', price: 20 }], [{ name: 'Updated' }], [{ price: 0 }]])(
      'should return no errors for %j',
      (input) => {
        expect(validateUpdateItem(input)).toEqual([]);
      },
    );
  });

  describe('body validation', () => {
    it('should return error when body is empty', () => {
      expect(validateUpdateItem({})).toEqual([
        { field: 'body', message: 'At least one field must be provided' },
      ]);
    });
  });

  describe('price validation', () => {
    it('should return error when price is negative', () => {
      expect(validateUpdateItem({ name: 'Updated', price: -10 })).toEqual([
        { field: 'price', message: 'Field "price" cannot be negative' },
      ]);
    });

    it('should return error when price is not a number', () => {
      expect(validateUpdateItem({ price: 'abc' })).toEqual([
        { field: 'price', message: 'Field "price" must be a number' },
      ]);
    });
  });
});
