import { prisma } from '../../database/db';

/**
 * Verifies that the history module is operational by running a lightweight
 * read query against the history table.
 *
 * Uses a direct Prisma count so no log entries are written during the check.
 *
 * Returns:
 *   True when the history table is reachable, false on any error.
 */
export async function historyHealthCheck(): Promise<boolean> {
  try {
    await prisma.history.count();
    return true;
  } catch {
    return false;
  }
}
