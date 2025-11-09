import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectMongo, disconnectMongo } from './db/mongoose';
import { ensureDefaultAdmin } from './services/admin';

const server = http.createServer(app);

async function start() {
  try {
    await connectMongo(env.MONGO_URI);
    await ensureDefaultAdmin();
    server.listen(env.PORT, () => {
      console.log(`API listening on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
signals.forEach((sig) => {
  process.on(sig, async () => {
    console.log(`Received ${sig}. Shutting down...`);
    server.close(async () => {
      await disconnectMongo();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000);
  });
});

start();
