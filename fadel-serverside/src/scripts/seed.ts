import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { connectMongo, disconnectMongo } from '../db/mongoose';
import { Product } from '../models/product.model';

async function main() {
  await connectMongo(env.MONGO_URI);
  const file = path.join(__dirname, '../../seed/products.json');
  const raw = fs.readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);

  for (const p of data) {
    await Product.updateOne({ slug: p.slug }, { $set: p }, { upsert: true });
    console.log('Upserted', p.slug);
  }

  await disconnectMongo();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

