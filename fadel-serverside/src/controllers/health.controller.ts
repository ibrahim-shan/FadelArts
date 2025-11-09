import type { Request, Response } from 'express';
import mongoose from 'mongoose';

export function health(req: Request, res: Response) {
  const mongo = mongoose.connection.readyState === 1 ? 'up' : 'down';
  res.json({ ok: true, uptime: process.uptime(), mongo });
}

