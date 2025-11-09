import bcrypt from 'bcryptjs';
import { Admin } from '../models/admin.model';
import { env } from '../config/env';

export async function ensureDefaultAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.warn('[admin] ADMIN_EMAIL/ADMIN_PASSWORD not set; no default admin created');
    return;
  }
  const existing = await Admin.findOne({ email: env.ADMIN_EMAIL });
  const hash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  if (!existing) {
    await Admin.create({ email: env.ADMIN_EMAIL, passwordHash: hash });
    console.log('[admin] Default admin created:', env.ADMIN_EMAIL);
    return;
  }
  const match = await bcrypt.compare(env.ADMIN_PASSWORD, existing.passwordHash);
  if (!match) {
    existing.passwordHash = hash;
    await existing.save();
    console.log('[admin] Admin password updated for:', env.ADMIN_EMAIL);
  }
}

