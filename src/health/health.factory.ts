import type { ILogger } from '../common/interfaces/logger.interface';
import type { ItemService } from '../modules/items/item.service';

export interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
}

export interface HealthDependencies {
  healthChecks: HealthCheck[];
}

/**
 * Builds the list of health checks for the application.
 *
 * In test mode all checks return true immediately (no real DB is available).
 * In production mode each check probes its respective dependency.
 *
 * Args:
 *   opts.isTest: When true, stubs all checks to pass without I/O.
 *   opts.itemService: ItemService instance used for the items health check.
 *   opts.historyService: ILogger instance (unused in prod check; kept for
 *     interface symmetry and future extension).
 *
 * Returns:
 *   The health dependencies with the configured healthChecks array.
 */
export async function createHealthDependencies(opts: {
  isTest: boolean;
  itemService: ItemService;
  historyService: ILogger;
}): Promise<HealthDependencies> {
  if (opts.isTest) {
    return {
      healthChecks: [
        { name: 'database', check: async () => true },
        { name: 'items', check: async () => true },
        { name: 'history', check: async () => true },
      ],
    };
  }

  const { databaseHealthCheck } = await import('./checks/database.check');
  const { itemsHealthCheck } = await import('./checks/items.check');
  const { historyHealthCheck } = await import('./checks/history.check');

  return {
    healthChecks: [
      { name: 'database', check: databaseHealthCheck },
      { name: 'items', check: () => itemsHealthCheck(opts.itemService) },
      { name: 'history', check: historyHealthCheck },
    ],
  };
}
