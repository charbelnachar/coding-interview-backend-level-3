import type { ItemService } from '../../modules/items/item.service';

/**
 * Verifies that the items module is operational by performing a findAll call.
 *
 * Args:
 *   itemService: The ItemService instance to probe.
 *
 * Returns:
 *   True when the service responds without throwing, false otherwise.
 */
export async function itemsHealthCheck(itemService: ItemService): Promise<boolean> {
  try {
    await itemService.findAll();
    return true;
  } catch {
    return false;
  }
}
