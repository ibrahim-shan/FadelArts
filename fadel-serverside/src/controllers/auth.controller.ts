import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin.model';
import { env } from '../config/env';
import { asyncHandler } from '../utils/async';

function setAuthCookie(res: Response, token: string) {
  const isProd = env.NODE_ENV === 'production';
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) return res.status(400).json({ ok: false, error: 'email and password are required' });

  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

  const token = jwt.sign({ sub: String(admin._id), email: admin.email, role: 'admin' }, env.JWT_SECRET, {
    expiresIn: '7d',
  });
  setAuthCookie(res, token);
  res.json({ ok: true, admin: { email: admin.email } });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(env.COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  res.json({ ok: true, admin: { email: user.email } });
});

