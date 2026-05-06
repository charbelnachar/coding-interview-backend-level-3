import type { IAuthValidator } from '../common/interfaces/auth-validator.interface';
import type { ILogger } from '../common/interfaces/logger.interface';
import { createAuthDependencies } from '../common/middlewares/auth-middleware';
import type { HealthCheck } from '../health/health.factory';
import { createHealthDependencies } from '../health/health.factory';
import { createHistoryDependencies } from '../modules/history/history.factory';
import type { ItemService } from '../modules/items/item.service';
import { createItemDependencies } from '../modules/items/items.factory';

export interface AppDependencies {
  itemService: ItemService;
  historyService: ILogger;
  healthChecks: HealthCheck[];
  authValidator: IAuthValidator;
}

/**
 * Assembles all application dependencies from per-module factories.
 *
 * When isTest is true, all modules use in-memory stubs and no database
 * connection is established. In production, the database is connected
 * before building the dependency graph.
 *
 * Args:
 *   isTest: When true, wires in-memory implementations for every module.
 *
 * Returns:
 *   The fully assembled AppDependencies ready for injection into the server.
 */
export async function createDependencies(isTest: boolean): Promise<AppDependencies> {
  if (!isTest) {
    const { connectDatabase } = await import('../database/db');
    await connectDatabase();

    if (process.env.RUN_SEED === 'true') {
      const { runSeed } = await import('../database/seeds/seed');
      await runSeed();
    }
  }

  const { historyService } = createHistoryDependencies({ isTest });
  const { itemService } = createItemDependencies({ isTest, logger: historyService });
  const { healthChecks } = await createHealthDependencies({ isTest, itemService, historyService });
  const { authValidator } = createAuthDependencies();

  return { itemService, historyService, healthChecks, authValidator };
}
