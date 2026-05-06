import type { Server } from '@hapi/hapi';
import { initializeServer } from '../../../src/server';

describe('Health Routes - Integration', () => {
  let server: Server;

  beforeEach(async () => {
    server = await initializeServer();
  });

  afterEach(async () => {
    await server.stop();
  });

  it('should return health status ok with all checks passing', async () => {
    const response = await server.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.result).toMatchObject({
      status: 'ok',
      database: 'connected',
    });
    expect((response.result as Record<string, unknown>).checks).toBeDefined();
  });
});
