import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().default('change-me'),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  COOKIE_NAME: z.string().default('fa_admin')
});

export type Env = z.infer<typeof EnvSchema>;
export const env = EnvSchema.parse(process.env);
