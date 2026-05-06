import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedUser, IAuthValidator } from '../interfaces/auth-validator.interface';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

class CharbelAuthValidator implements IAuthValidator {
  async validate(_credentials: unknown): Promise<AuthenticatedUser> {
    return { userId: 'charbel', username: 'charbel' };
  }
}

export interface AuthDependencies {
  authValidator: IAuthValidator;
}

export function createAuthDependencies(): AuthDependencies {
  return {
    authValidator: new CharbelAuthValidator(),
  };
}

export function createAuthMiddleware(validator: IAuthValidator) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authorization = req.headers.authorization;
      const credentials = authorization?.startsWith('Bearer ')
        ? authorization.slice(7)
        : authorization;

      const user = await validator.validate(credentials);
      if (user) {
        req.user = user;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
