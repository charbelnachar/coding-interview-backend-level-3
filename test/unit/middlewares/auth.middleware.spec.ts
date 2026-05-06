import type { NextFunction, Request, Response } from 'express';
import type { IAuthValidator } from '../../../src/common/interfaces/auth-validator.interface';
import { createAuthMiddleware } from '../../../src/common/middlewares/auth-middleware';

function makeReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

function makeRes(): Response {
  return {} as Response;
}

describe('auth.middleware', () => {
  let validator: jest.Mocked<IAuthValidator>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    validator = { validate: jest.fn() };
    next = jest.fn();
  });

  it('should attach user to req when validator resolves a user', async () => {
    validator.validate.mockResolvedValue({ userId: 'charbel', username: 'charbel' });
    const req = makeReq({ authorization: 'Bearer some.token' });
    const middleware = createAuthMiddleware(validator);

    await middleware(req, makeRes(), next);

    expect(req.user).toEqual({ userId: 'charbel', username: 'charbel' });
    expect(next).toHaveBeenCalledWith();
  });

  it('should not set req.user when validator returns null', async () => {
    validator.validate.mockResolvedValue(null);
    const req = makeReq();
    const middleware = createAuthMiddleware(validator);

    await middleware(req, makeRes(), next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });

  it('should pass the Bearer token to the validator', async () => {
    validator.validate.mockResolvedValue(null);
    const req = makeReq({ authorization: 'Bearer my-token' });
    const middleware = createAuthMiddleware(validator);

    await middleware(req, makeRes(), next);

    expect(validator.validate).toHaveBeenCalledWith('my-token');
  });

  it('should forward errors thrown by the validator to next()', async () => {
    const error = new Error('Validator failed');
    validator.validate.mockRejectedValue(error);
    const req = makeReq({ authorization: 'Bearer token' });
    const middleware = createAuthMiddleware(validator);

    await middleware(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
