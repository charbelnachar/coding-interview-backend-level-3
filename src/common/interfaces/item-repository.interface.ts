import type { Item } from '@prisma/client';

export interface IItemRepository {
  findAll(): Promise<Item[]>;
  findById(id: number): Promise<Item | null>;
  create(data: { name: string; price: number }): Promise<Item>;
  update(id: number, data: { name?: string; price?: number }): Promise<Item | null>;
  delete(id: number): Promise<boolean>;
}
