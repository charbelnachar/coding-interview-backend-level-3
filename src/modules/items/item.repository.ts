import type { Item } from '@prisma/client';
import type { IItemRepository } from '../../common/interfaces/item-repository.interface';
import { prisma } from '../../database/db';

/**
 * Prisma-backed implementation of IItemRepository.
 *
 * All methods delegate directly to the Prisma client. Errors on update
 * and delete (e.g. record not found) are caught and returned as null/false
 * rather than propagated, keeping the service layer free of Prisma errors.
 */

export class ItemRepository implements IItemRepository {
  async findAll(): Promise<Item[]> {
    return prisma.item.findMany();
  }

  async findById(id: number): Promise<Item | null> {
    return prisma.item.findUnique({ where: { id } });
  }

  async create(data: { name: string; price: number }): Promise<Item> {
    return prisma.item.create({ data });
  }

  async update(id: number, data: { name?: string; price?: number }): Promise<Item | null> {
    try {
      return await prisma.item.update({
        where: { id },
        data,
      });
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.item.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
