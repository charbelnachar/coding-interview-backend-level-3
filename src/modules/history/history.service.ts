import type { ILogger } from '../../common/interfaces/logger.interface';
import { prisma } from '../../database/db';

/**
 * Prisma-backed implementation of ILogger.
 *
 * Persists every mutation event to the history table as an append-only
 * audit log. The payload is serialised to JSON before storage.
 */
export class HistoryService implements ILogger {
  /**
   * Records a mutation event in the history table.
   *
   * Args:
   *   action: The operation performed (e.g. "CREATE", "UPDATE", "DELETE").
   *   entityType: The resource type being mutated (e.g. "item").
   *   entityId: The numeric primary key of the affected record.
   *   userId: Optional identifier of the user who triggered the action.
   *   payload: Optional data associated with the mutation (serialised to JSON).
   */
  async addLog(
    action: string,
    entityType: string,
    entityId?: number,
    userId?: string,
    payload?: any,
  ): Promise<void> {
    await prisma.history.create({
      data: {
        action,
        entityType,
        entityId: entityId ?? 0,
        userId: userId || null,
        payload: payload ? JSON.stringify(payload) : null,
      },
    });
  }
}
