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

  describe('when validator resolves a user', () => {
    it('should attach the user to req', async () => {
      validator.validate.mockResolvedValue({ userId: 'charbel', username: 'charbel' });
      const req = makeReq({ authorization: 'Bearer some.token' });

      await createAuthMiddleware(validator)(req, makeRes(), next);

      expect(req.user).toEqual({ userId: 'charbel', username: 'charbel' });
    });

    it('should call next without arguments', async () => {
      validator.validate.mockResolvedValue({ userId: 'charbel', username: 'charbel' });
      const req = makeReq({ authorization: 'Bearer some.token' });

      await createAuthMiddleware(validator)(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('when validator returns null', () => {
    it('should not set req.user', async () => {
      validator.validate.mockResolvedValue(null);
      const req = makeReq();

      await createAuthMiddleware(validator)(req, makeRes(), next);

      expect(req.user).toBeUndefined();
    });

    it('should call next without arguments', async () => {
      validator.validate.mockResolvedValue(null);

      await createAuthMiddleware(validator)(makeReq(), makeRes(), next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('token extraction', () => {
    it('should pass the Bearer token value to the validator', async () => {
      validator.validate.mockResolvedValue(null);
      const req = makeReq({ authorization: 'Bearer my-token' });

      await createAuthMiddleware(validator)(req, makeRes(), next);

      expect(validator.validate).toHaveBeenCalledWith('my-token');
    });
  });

  describe('when validator throws', () => {
    it('should forward the error to next()', async () => {
      const error = new Error('Validator failed');
      validator.validate.mockRejectedValue(error);

      await createAuthMiddleware(validator)(
        makeReq({ authorization: 'Bearer token' }),
        makeRes(),
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
