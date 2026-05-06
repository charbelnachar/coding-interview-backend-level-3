import { prisma } from '../../database/db';

/**
 * Verifies that the database is reachable by running a lightweight query.
 *
 * Returns:
 *   True when the database responds, false on any connection error.
 */
export async function databaseHealthCheck(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
