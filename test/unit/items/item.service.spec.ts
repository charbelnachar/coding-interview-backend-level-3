import type { ILogger } from '../../../src/common/interfaces/logger.interface';
import type { ItemRepository } from '../../../src/modules/items/item.repository';
import { ItemService } from '../../../src/modules/items/item.service';

describe('ItemService', () => {
  let itemService: ItemService;
  let mockRepository: jest.Mocked<ItemRepository>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockLogger = {
      addLog: jest.fn().mockResolvedValue(undefined),
    };

    itemService = new ItemService(mockRepository, mockLogger);
  });

  describe('findAll', () => {
    it('should return all items', async () => {
      const items = [{ id: 1, name: 'Item 1', price: 10 }];
      mockRepository.findAll.mockResolvedValue(items);

      const result = await itemService.findAll();
      expect(result).toEqual(items);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no items', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await itemService.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return item when found', async () => {
      const item = { id: 1, name: 'Item 1', price: 10 };
      mockRepository.findById.mockResolvedValue(item);

      const result = await itemService.findById(1);
      expect(result).toEqual(item);
    });

    it('should return null when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await itemService.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create item and log', async () => {
      const data = { name: 'New Item', price: 25 };
      const created = { id: 1, ...data };
      mockRepository.create.mockResolvedValue(created);

      const result = await itemService.create(data);
      expect(result).toEqual(created);
      expect(mockLogger.addLog).toHaveBeenCalledWith('CREATE', 'item', 1, undefined, data);
    });
  });

  describe('update', () => {
    it('should update item and log', async () => {
      const data = { name: 'Updated', price: 30 };
      const updated = { id: 1, ...data };
      mockRepository.update.mockResolvedValue(updated);

      const result = await itemService.update(1, data);
      expect(result).toEqual(updated);
      expect(mockLogger.addLog).toHaveBeenCalledWith('UPDATE', 'item', 1, undefined, data);
    });

    it('should return null and not log when item not found', async () => {
      mockRepository.update.mockResolvedValue(null);

      const result = await itemService.update(999, { name: 'X' });
      expect(result).toBeNull();
      expect(mockLogger.addLog).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete item and log', async () => {
      mockRepository.delete.mockResolvedValue(true);

      const result = await itemService.delete(1);
      expect(result).toBe(true);
      expect(mockLogger.addLog).toHaveBeenCalledWith('DELETE', 'item', 1);
    });

    it('should return false and not log when item not found', async () => {
      mockRepository.delete.mockResolvedValue(false);

      const result = await itemService.delete(999);
      expect(result).toBe(false);
      expect(mockLogger.addLog).not.toHaveBeenCalled();
    });
  });
});
