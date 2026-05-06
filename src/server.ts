import type { Server as HttpServer } from 'node:http';
import type { Server as HapiServer } from '@hapi/hapi';
import express from 'express';
import { createAuthMiddleware } from './common/middlewares/auth-middleware';
import { errorHandlerMiddleware } from './common/middlewares/error-handler.middleware';
import { loadConfig } from './config';
import { createDependencies } from './config/dependency-factory';
import { buildRouter } from './routes';

/**
 * Builds and configures the Express application without starting it.
 *
 * Wires dependencies, registers global middlewares, and mounts all routes.
 * Separated from listen() so the app instance can be used in tests.
 *
 * Returns:
 *   A tuple of [express app, AppDependencies] ready to listen or inject.
 */
async function buildApp() {
  const config = loadConfig();
  const isTest = config.nodeEnv === 'test';
  const deps = await createDependencies(isTest);

  const app = express();
  app.use(express.json());
  app.use(createAuthMiddleware(deps.authValidator));
  app.use(buildRouter(deps));
  app.use(errorHandlerMiddleware);

  return { app, config };
}

/**
 * Initialises the server for testing by wrapping the Express app with a
 * supertest-based inject() adapter that matches the Hapi Server interface.
 *
 * The app is bound to an ephemeral port. inject() dispatches HTTP requests
 * without going through the OS network stack and maps the response to the
 * shape expected by the existing e2e test suite.
 *
 * Returns:
 *   An object that satisfies the Hapi Server interface used by e2e tests,
 *   backed by a real Express HTTP server on an ephemeral port.
 */
export const initializeServer = async (): Promise<HapiServer> => {
  const { app } = await buildApp();

  const httpServer: HttpServer = await new Promise((resolve) => {
    const srv = app.listen(0, () => resolve(srv));
  });

  const { default: request } = await import('supertest');
  const agent = request(httpServer);

  const adapter = {
    inject: async (opts: {
      method: string;
      url: string;
      payload?: unknown;
      headers?: Record<string, string>;
    }) => {
      const method = opts.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
      let req = agent[method](opts.url);

      if (opts.headers) {
        for (const [key, value] of Object.entries(opts.headers)) {
          req = req.set(key, value);
        }
      }

      if (opts.payload !== undefined) {
        req = req.send(opts.payload as object);
      }

      const res = await req;

      let result: unknown;
      try {
        result =
          typeof res.body === 'object' && res.body !== null ? res.body : JSON.parse(res.text);
      } catch {
        result = res.text;
      }

      return {
        statusCode: res.status,
        result,
        payload: res.text,
        headers: res.headers,
      };
    },

    stop: (): Promise<void> =>
      new Promise((resolve, reject) => httpServer.close((err) => (err ? reject(err) : resolve()))),
  };

  return adapter as unknown as HapiServer;
};

/**
 * Starts the HTTP server and begins listening for connections.
 *
 * Used as the production entry point. Attaches SIGTERM / SIGINT handlers
 * for graceful shutdown.
 *
 * Returns:
 *   The underlying Node http.Server instance.
 */
export const startServer = async (): Promise<HttpServer> => {
  const { app, config } = await buildApp();

  const httpServer = app.listen(config.port, config.host, () => {
    console.log(`Server running on http://${config.host}:${config.port}`);
  });

  const shutdown = () => {
    console.log('Shutting down server...');
    httpServer.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return httpServer;
};
