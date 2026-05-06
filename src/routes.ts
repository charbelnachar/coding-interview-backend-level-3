import { Router } from 'express';
import type { AppDependencies } from './config/dependency-factory';
import { createHealthRouter } from './health/health.routes';
import { createItemRouter } from './modules/items/item.routes';

/**
 * Builds the root Express router by composing all module routers.
 *
 * All application routes are registered here and exported as a single
 * router that the server mounts. This keeps server.ts clean and makes
 * it easy to add new modules.
 *
 * Args:
 *   deps: The fully assembled application dependencies.
 *
 * Returns:
 *   A configured Express Router with all application routes mounted.
 */
export function buildRouter(deps: AppDependencies): Router {
  const router = Router();

  router.get('/ping', (_req, res) => {
    res.json({ ok: true });
  });

  router.use(createItemRouter(deps.itemService));
  router.use(createHealthRouter(deps.healthChecks));

  return router;
}
