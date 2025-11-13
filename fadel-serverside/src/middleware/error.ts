import type { Request, Response, NextFunction } from "express";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ ok: false, error: "Not Found" });
}

type HttpError = {
  message?: string;
  status?: number;
  statusCode?: number;
};

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const e = (err ?? {}) as HttpError;
  const status = e.status ?? e.statusCode ?? 500;
  const message = e.message && typeof e.message === "string" ? e.message : "Internal Server Error";
  res.status(status).json({ ok: false, error: message });
}
