import type { Request, Response, NextFunction } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ ok: false, error: "Not Found" });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  const status = err?.status ?? 500;
  res.status(status).json({ ok: false, error: err?.message ?? "Internal Server Error" });
}
