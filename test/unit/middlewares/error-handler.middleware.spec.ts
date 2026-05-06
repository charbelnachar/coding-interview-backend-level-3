import type { NextFunction, Request, Response } from 'express';
import { NotFoundException } from '../../../src/common/exceptions/not-found.exception';
import { ValidationException } from '../../../src/common/exceptions/validation.exception';
import { errorHandlerMiddleware } from '../../../src/common/middlewares/error-handler.middleware';

function makeRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

const noopReq = {} as Request;
const noopNext = (() => {}) as NextFunction;

describe('error-handler.middleware', () => {
  it('should return 400 with errors for ValidationException', () => {
    const err = new ValidationException([{ field: 'price', message: 'Field "price" is required' }]);
    const res = makeRes();

    errorHandlerMiddleware(err, noopReq, res, noopNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ field: 'price', message: 'Field "price" is required' }],
    });
  });

  it('should return 404 with message for NotFoundException', () => {
    const err = new NotFoundException('Item', 99);
    const res = makeRes();

    errorHandlerMiddleware(err, noopReq, res, noopNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Item with id 99 not found' });
  });

  it('should return 500 for unknown errors', () => {
    const err = new Error('Something went wrong');
    const res = makeRes();

    errorHandlerMiddleware(err, noopReq, res, noopNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });

  it('should not interfere when the error is undefined', () => {
    const res = makeRes();

    errorHandlerMiddleware(undefined, noopReq, res, noopNext);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
