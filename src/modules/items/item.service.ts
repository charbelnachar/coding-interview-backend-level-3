import type { Item } from '@prisma/client';
import type { IItemRepository } from '../../common/interfaces/item-repository.interface';
import type { ILogger } from '../../common/interfaces/logger.interface';

/**
 * Business logic layer for the items resource.
 *
 * Delegates persistence to IItemRepository and logs every mutation via
 * ILogger so that a full audit trail is maintained in the history table.
 */
export class ItemService {
  constructor(
    private readonly itemRepository: IItemRepository,
    private readonly logger: ILogger,
  ) {}

  /**
   * Returns all items in the store.
   *
   * Returns:
   *   A promise that resolves to the full list of items.
   */
  async findAll(): Promise<Item[]> {
    return this.itemRepository.findAll();
  }

  /**
   * Finds a single item by its numeric ID.
   *
   * Args:
   *   id: The item's primary key.
   *
   * Returns:
   *   The matching item, or null when not found.
   */
  async findById(id: number): Promise<Item | null> {
    return this.itemRepository.findById(id);
  }

  /**
   * Creates a new item and logs the operation.
   *
   * Args:
   *   data: The fields required to create the item.
   *
   * Returns:
   *   The newly created item with its generated ID.
   */
  async create(data: { name: string; price: number }, userId?: string): Promise<Item> {
    const item = await this.itemRepository.create(data);
    await this.logger.addLog('CREATE', 'item', item.id, userId, data);
    return item;
  }

  /**
   * Updates an existing item and logs the operation when found.
   *
   * Args:
   *   id: The item's primary key.
   *   data: The fields to update (all optional for partial updates).
   *
   * Returns:
   *   The updated item, or null when the ID does not exist.
   */
  async update(
    id: number,
    data: { name?: string; price?: number },
    userId?: string,
  ): Promise<Item | null> {
    const item = await this.itemRepository.update(id, data);
    if (item) {
      await this.logger.addLog('UPDATE', 'item', item.id, userId, data);
    }
    return item;
  }

  /**
   * Deletes an item by ID and logs the operation when found.
   *
   * Args:
   *   id: The item's primary key.
   *
   * Returns:
   *   True when the item was deleted, false when it did not exist.
   */
  async delete(id: number, userId?: string): Promise<boolean> {
    const deleted = await this.itemRepository.delete(id);
    if (deleted) {
      await this.logger.addLog('DELETE', 'item', id, userId);
    }
    return deleted;
  }
}
