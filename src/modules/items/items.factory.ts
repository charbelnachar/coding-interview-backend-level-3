import type { Item } from '@prisma/client';
import type { IItemRepository } from '../../common/interfaces/item-repository.interface';
import type { ILogger } from '../../common/interfaces/logger.interface';
import { ItemRepository } from './item.repository';
import { ItemService } from './item.service';

export interface ItemDependencies {
  itemService: ItemService;
}

/**
 * Creates an in-memory IItemRepository for use in test environments.
 *
 * Maintains a Map-based store with auto-incrementing IDs. The returned
 * object fully implements IItemRepository without any database connection.
 *
 * Returns:
 *   An IItemRepository backed by in-process memory.
 */
function createInMemoryItemRepository(): IItemRepository {
  const store = new Map<number, Item>();
  let nextId = 1;

  return {
    async findAll() {
      return Array.from(store.values());
    },
    async findById(id) {
      return store.get(id) ?? null;
    },
    async create(data) {
      const item: Item = { id: nextId++, ...data };
      store.set(item.id, item);
      return item;
    },
    async update(id, data) {
      const item = store.get(id);
      if (!item) return null;
      const updated = { ...item, ...data };
      store.set(id, updated);
      return updated;
    },
    async delete(id) {
      return store.delete(id);
    },
  };
}

/**
 * Builds the items module dependencies.
 *
 * In test mode an in-memory repository is used so no database connection
 * is required. In production mode the real Prisma-backed repository is used.
 *
 * Args:
 *   opts.isTest: When true, wires an in-memory repository.
 *   opts.logger: Logger service injected into ItemService for mutation tracking.
 *
 * Returns:
 *   The items module dependencies with the configured itemService.
 */
export function createItemDependencies(opts: {
  isTest: boolean;
  logger: ILogger;
}): ItemDependencies {
  const repo: IItemRepository = opts.isTest ? createInMemoryItemRepository() : new ItemRepository();

  return {
    itemService: new ItemService(repo, opts.logger),
  };
}
