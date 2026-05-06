import type { Server } from '@hapi/hapi';
import { initializeServer } from '../../../src/server';

describe('Item Routes - Integration', () => {
  let server: Server;

  beforeEach(async () => {
    server = await initializeServer();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe('GET /items', () => {
    it('should return empty array initially', async () => {
      const response = await server.inject({ method: 'GET', url: '/items' });
      expect(response.statusCode).toBe(200);
      expect(response.result).toEqual([]);
    });
  });

  describe('POST /items', () => {
    it('should create an item with status 201', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/items',
        payload: { name: 'Widget', price: 15.5 },
      });
      expect(response.statusCode).toBe(201);
      expect(response.result).toEqual({
        id: expect.any(Number),
        name: 'Widget',
        price: 15.5,
      });
    });

    it('should reject missing name', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/items',
        payload: { price: 10 },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should reject missing price', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/items',
        payload: { name: 'Test' },
      });
      expect(response.statusCode).toBe(400);
      expect((response.result as any).errors[0].field).toBe('price');
    });

    it('should reject negative price', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/items',
        payload: { name: 'Test', price: -1 },
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /items/{id}', () => {
    it('should return 404 for non-existent item', async () => {
      const response = await server.inject({ method: 'GET', url: '/items/999' });
      expect(response.statusCode).toBe(404);
    });

    it('should return item by id', async () => {
      const createRes = await server.inject({
        method: 'POST',
        url: '/items',
        payload: { name: 'Test', price: 5 },
      });
      const id = (createRes.result as any).id;

      const response = await server.inject({ method: 'GET', url: `/items/${id}` });
      expect(response.statusCode).toBe(200);
      expect((response.result as any).name).toBe('Test');
    });
  });

  describe('PUT /items/{id}', () => {
    it('should update an existing item', async () => {
      const createRes = await server.inject({
        method: 'POST',
        url: '/items',
        payload: { name: 'Old', price: 10 },
      });
      const id = (createRes.result as any).id;

      const response = await server.inject({
        method: 'PUT',
        url: `/items/${id}`,
        payload: { name: 'New', price: 20 },
      });
      expect(response.statusCode).toBe(200);
      expect(response.result).toEqual({ id, name: 'New', price: 20 });
    });

    it('should return 404 for non-existent item', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/items/999',
        payload: { name: 'X', price: 1 },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should reject negative price on update', async () => {
      const createRes = await server.inject({
        method: 'POST',
        url: '/items',
        payload: { name: 'Item', price: 10 },
      });
      const id = (createRes.result as any).id;

      const response = await server.inject({
        method: 'PUT',
        url: `/items/${id}`,
        payload: { name: 'Item', price: -5 },
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /items/{id}', () => {
    it('should delete an item with 204', async () => {
      const createRes = await server.inject({
        method: 'POST',
        url: '/items',
        payload: { name: 'Delete Me', price: 5 },
      });
      const id = (createRes.result as any).id;

      const response = await server.inject({ method: 'DELETE', url: `/items/${id}` });
      expect(response.statusCode).toBe(204);
    });

    it('should return 404 when deleting non-existent item', async () => {
      const response = await server.inject({ method: 'DELETE', url: '/items/999' });
      expect(response.statusCode).toBe(404);
    });
  });
});
