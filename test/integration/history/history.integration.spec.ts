import { createInMemoryHistoryService } from '../../../src/modules/history/history.factory';
import type { ItemService } from '../../../src/modules/items/item.service';
import { createItemDependencies } from '../../../src/modules/items/items.factory';

describe('History Integration (in-memory)', () => {
  let itemService: ItemService;
  let historyService: ReturnType<typeof createInMemoryHistoryService>;

  beforeEach(() => {
    historyService = createInMemoryHistoryService();
    const { itemService: svc } = createItemDependencies({
      isTest: true,
      logger: historyService,
    });
    itemService = svc;
  });

  it('should log CREATE when item is created', async () => {
    await itemService.create({ name: 'Test', price: 10 });
    expect(historyService.logs).toHaveLength(1);
    expect((historyService.logs[0] as Record<string, unknown>).action).toBe('CREATE');
    expect((historyService.logs[0] as Record<string, unknown>).entityType).toBe('item');
  });

  it('should log UPDATE when item is updated', async () => {
    const item = await itemService.create({ name: 'Test', price: 10 });
    await itemService.update(item.id, { name: 'Updated', price: 20 });
    expect(historyService.logs).toHaveLength(2);
    expect((historyService.logs[1] as Record<string, unknown>).action).toBe('UPDATE');
  });

  it('should log DELETE when item is deleted', async () => {
    const item = await itemService.create({ name: 'Test', price: 10 });
    await itemService.delete(item.id);
    expect(historyService.logs).toHaveLength(2);
    expect((historyService.logs[1] as Record<string, unknown>).action).toBe('DELETE');
  });

  it('should not log UPDATE when item is not found', async () => {
    await itemService.update(999, { name: 'X' });
    expect(historyService.logs).toHaveLength(0);
  });

  it('should not log DELETE when item is not found', async () => {
    await itemService.delete(999);
    expect(historyService.logs).toHaveLength(0);
  });
});
