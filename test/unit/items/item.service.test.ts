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

    it('should return empty array when no items exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await itemService.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    describe('when item exists', () => {
      it('should return the item', async () => {
        const item = { id: 1, name: 'Item 1', price: 10 };
        mockRepository.findById.mockResolvedValue(item);

        const result = await itemService.findById(1);
        expect(result).toEqual(item);
      });
    });

    describe('when item does not exist', () => {
      it('should return null', async () => {
        mockRepository.findById.mockResolvedValue(null);

        const result = await itemService.findById(999);
        expect(result).toBeNull();
      });
    });
  });

  describe('create', () => {
    it('should return the created item', async () => {
      const data = { name: 'New Item', price: 25 };
      const created = { id: 1, ...data };
      mockRepository.create.mockResolvedValue(created);

      const result = await itemService.create(data);
      expect(result).toEqual(created);
    });

    it('should log the CREATE action', async () => {
      const data = { name: 'New Item', price: 25 };
      mockRepository.create.mockResolvedValue({ id: 1, ...data });

      await itemService.create(data);
      expect(mockLogger.addLog).toHaveBeenCalledWith('CREATE', 'item', 1, undefined, data);
    });
  });

  describe('update', () => {
    describe('when item exists', () => {
      it('should return the updated item', async () => {
        const data = { name: 'Updated', price: 30 };
        mockRepository.update.mockResolvedValue({ id: 1, ...data });

        const result = await itemService.update(1, data);
        expect(result).toEqual({ id: 1, ...data });
      });

      it('should log the UPDATE action', async () => {
        const data = { name: 'Updated', price: 30 };
        mockRepository.update.mockResolvedValue({ id: 1, ...data });

        await itemService.update(1, data);
        expect(mockLogger.addLog).toHaveBeenCalledWith('UPDATE', 'item', 1, undefined, data);
      });
    });

    describe('when item does not exist', () => {
      it('should return null', async () => {
        mockRepository.update.mockResolvedValue(null);

        const result = await itemService.update(999, { name: 'X' });
        expect(result).toBeNull();
      });

      it('should not log', async () => {
        mockRepository.update.mockResolvedValue(null);

        await itemService.update(999, { name: 'X' });
        expect(mockLogger.addLog).not.toHaveBeenCalled();
      });
    });
  });

  describe('delete', () => {
    describe('when item exists', () => {
      it('should return true', async () => {
        mockRepository.delete.mockResolvedValue(true);

        const result = await itemService.delete(1);
        expect(result).toBe(true);
      });

      it('should log the DELETE action', async () => {
        mockRepository.delete.mockResolvedValue(true);

        await itemService.delete(1);
        expect(mockLogger.addLog).toHaveBeenCalledWith('DELETE', 'item', 1, undefined);
      });
    });

    describe('when item does not exist', () => {
      it('should return false', async () => {
        mockRepository.delete.mockResolvedValue(false);

        const result = await itemService.delete(999);
        expect(result).toBe(false);
      });

      it('should not log', async () => {
        mockRepository.delete.mockResolvedValue(false);

        await itemService.delete(999);
        expect(mockLogger.addLog).not.toHaveBeenCalled();
      });
    });
  });
});
