import type { Request, Response, Router } from 'express';
import { Router as createRouter } from 'express';
import type { HealthCheck } from './health.factory';

/**
 * Builds the Express router for the health endpoint.
 *
 * Runs all provided checks in parallel. If every check passes the endpoint
 * returns 200 with status "ok". If any check fails it returns 503 with
 * status "error". Individual check results are reported per name.
 *
 * Args:
 *   healthChecks: Array of named health check functions to run.
 *
 * Returns:
 *   A configured Express Router with GET /health mounted.
 */
export function createHealthRouter(healthChecks: HealthCheck[]): Router {
  const router = createRouter();

  router.get('/health', async (_req: Request, res: Response) => {
    const results = await Promise.all(
      healthChecks.map(async ({ name, check }) => ({
        name,
        ok: await check().catch(() => false),
      })),
    );

    const allOk = results.every((r) => r.ok);

    const checks: Record<string, string> = {};
    for (const r of results) {
      checks[r.name] = r.ok ? 'ok' : 'error';
    }

    const databaseOk = results.find((r) => r.name === 'database')?.ok ?? false;

    const body = {
      status: allOk ? 'ok' : 'error',
      database: databaseOk ? 'connected' : 'disconnected',
      checks,
    };

    res.status(allOk ? 200 : 503).json(body);
  });

  return router;
}
