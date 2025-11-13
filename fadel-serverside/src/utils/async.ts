import type { Request, Response, NextFunction } from "express";

type RouteHandler = (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>;

export function asyncHandler<T extends RouteHandler>(fn: T): RouteHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
