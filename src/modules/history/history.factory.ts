import type { ILogger } from '../../common/interfaces/logger.interface';
import { HistoryService } from './history.service';

export interface HistoryDependencies {
  historyService: ILogger;
}

/**
 * Creates an in-memory ILogger for use in test environments.
 *
 * Accumulates log entries in an array. Useful for asserting what was
 * logged after an operation without any database interaction.
 *
 * Returns:
 *   An ILogger backed by in-process memory.
 */
export function createInMemoryHistoryService(): ILogger & { logs: unknown[] } {
  const logs: unknown[] = [];
  return {
    logs,
    async addLog(action, entityType, entityId, userId?, payload?) {
      logs.push({ action, entityType, entityId, userId, payload });
    },
  };
}

/**
 * Builds the history module dependencies.
 *
 * In test mode an in-memory service accumulates logs without touching the
 * database. In production mode the real Prisma-backed HistoryService is used.
 *
 * Args:
 *   opts.isTest: When true, wires an in-memory logger.
 *
 * Returns:
 *   The history module dependencies with the configured historyService.
 */
export function createHistoryDependencies(opts: { isTest: boolean }): HistoryDependencies {
  const historyService: ILogger = opts.isTest
    ? createInMemoryHistoryService()
    : new HistoryService();

  return { historyService };
}
