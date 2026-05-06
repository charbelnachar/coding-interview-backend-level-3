import type { NextFunction, Request, Response, Router } from 'express';
import { Router as createRouter } from 'express';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { ValidationException } from '../../common/exceptions/validation.exception';
import type { ItemService } from './item.service';
import { validateCreateItem, validateUpdateItem } from './item.validator';

/**
 * Builds the Express router for the items resource.
 *
 * Registers CRUD endpoints under /items. Validation errors are surfaced
 * via next(ValidationException) and resolved by the global error middleware.
 *
 * Args:
 *   itemService: The item service instance used to fulfil each request.
 *
 * Returns:
 *   A configured Express Router with all item endpoints mounted.
 */
export function createItemRouter(itemService: ItemService): Router {
  const router = createRouter();

  router.get('/items', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await itemService.findAll();
      res.json(items);
    } catch (err) {
      next(err);
    }
  });

  router.get(
    '/items/:id',
    async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
      try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return next(new NotFoundException('Item', req.params.id));
        const item = await itemService.findById(id);
        if (!item) {
          return next(new NotFoundException('Item', id));
        }
        res.json(item);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post('/items', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body ?? {};
      const errors = validateCreateItem(body);
      if (errors.length > 0) {
        return next(new ValidationException(errors));
      }
      const item = await itemService.create(
        { name: body.name, price: body.price },
        req.user?.userId,
      );
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  });

  router.put(
    '/items/:id',
    async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
      try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return next(new NotFoundException('Item', req.params.id));
        const body = req.body ?? {};
        const errors = validateUpdateItem(body);
        if (errors.length > 0) {
          return next(new ValidationException(errors));
        }
        const item = await itemService.update(
          id,
          { name: body.name, price: body.price },
          req.user?.userId,
        );
        if (!item) {
          return next(new NotFoundException('Item', id));
        }
        res.json(item);
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete(
    '/items/:id',
    async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
      try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return next(new NotFoundException('Item', req.params.id));
        const deleted = await itemService.delete(id, req.user?.userId);
        if (!deleted) {
          return next(new NotFoundException('Item', id));
        }
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
