import type { NextFunction, Request, Response } from 'express';
import { NotFoundException } from '../../../src/common/exceptions/not-found.exception';
import { ValidationException } from '../../../src/common/exceptions/validation.exception';
import { errorHandlerMiddleware } from '../../../src/common/middlewares/error-handler.middleware';

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

const noopReq = {} as Request;
const noopNext = (() => {}) as NextFunction;

describe('error-handler.middleware', () => {
  describe('ValidationException', () => {
    it('should respond with 400', () => {
      const err = new ValidationException([
        { field: 'price', message: 'Field "price" is required' },
      ]);
      const res = makeRes();

      errorHandlerMiddleware(err, noopReq, res, noopNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should include the validation errors in the body', () => {
      const err = new ValidationException([
        { field: 'price', message: 'Field "price" is required' },
      ]);
      const res = makeRes();

      errorHandlerMiddleware(err, noopReq, res, noopNext);

      expect(res.json).toHaveBeenCalledWith({
        errors: [{ field: 'price', message: 'Field "price" is required' }],
      });
    });
  });

  describe('NotFoundException', () => {
    it('should respond with 404', () => {
      const err = new NotFoundException('Item', 99);
      const res = makeRes();

      errorHandlerMiddleware(err, noopReq, res, noopNext);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should include a descriptive message in the body', () => {
      const err = new NotFoundException('Item', 99);
      const res = makeRes();

      errorHandlerMiddleware(err, noopReq, res, noopNext);

      expect(res.json).toHaveBeenCalledWith({ message: 'Item with id 99 not found' });
    });
  });

  describe('unknown errors', () => {
    it('should respond with 500 for a generic Error', () => {
      const res = makeRes();

      errorHandlerMiddleware(new Error('Something went wrong'), noopReq, res, noopNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });

    it('should respond with 500 when error is undefined', () => {
      const res = makeRes();

      errorHandlerMiddleware(undefined, noopReq, res, noopNext);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
