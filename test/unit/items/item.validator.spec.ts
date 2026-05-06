import { validateCreateItem, validateUpdateItem } from '../../../src/modules/items/item.validator';

describe('Item Validator', () => {
  describe('validateCreateItem', () => {
    it('should return no errors for valid payload', () => {
      const errors = validateCreateItem({ name: 'Test', price: 10 });
      expect(errors).toEqual([]);
    });

    it('should return error when price is missing', () => {
      const errors = validateCreateItem({ name: 'Test' });
      expect(errors).toEqual([{ field: 'price', message: 'Field "price" is required' }]);
    });

    it('should return error when price is null', () => {
      const errors = validateCreateItem({ name: 'Test', price: null });
      expect(errors).toEqual([{ field: 'price', message: 'Field "price" is required' }]);
    });

    it('should return error when price is negative', () => {
      const errors = validateCreateItem({ name: 'Test', price: -5 });
      expect(errors).toEqual([{ field: 'price', message: 'Field "price" cannot be negative' }]);
    });

    it('should return error when name is missing', () => {
      const errors = validateCreateItem({ price: 10 });
      expect(errors).toEqual([{ field: 'name', message: 'Field "name" is required' }]);
    });

    it('should return multiple errors when both fields are missing', () => {
      const errors = validateCreateItem({});
      expect(errors).toHaveLength(2);
    });

    it('should allow price of zero', () => {
      const errors = validateCreateItem({ name: 'Free Item', price: 0 });
      expect(errors).toEqual([]);
    });
  });

  describe('validateUpdateItem', () => {
    it('should return no errors for valid payload', () => {
      const errors = validateUpdateItem({ name: 'Updated', price: 20 });
      expect(errors).toEqual([]);
    });

    it('should return error when price is negative', () => {
      const errors = validateUpdateItem({ name: 'Updated', price: -10 });
      expect(errors).toEqual([{ field: 'price', message: 'Field "price" cannot be negative' }]);
    });

    it('should allow missing price (partial update)', () => {
      const errors = validateUpdateItem({ name: 'Updated' });
      expect(errors).toEqual([]);
    });

    it('should allow price of zero', () => {
      const errors = validateUpdateItem({ price: 0 });
      expect(errors).toEqual([]);
    });
  });
});
