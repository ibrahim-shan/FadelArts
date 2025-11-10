# Fadel Server (Node.js + Express + MongoDB)

A TypeScript Express API prepared for MongoDB with sane defaults.

## Quick start

- Requirements: Node 18+, npm, and a running MongoDB (local or Atlas).

```
cd fadel-serverside
cp .env.example .env
# edit .env with your values

# install deps
npm install

# start dev server
npm run dev
```

API will listen on `http://localhost:${PORT}` (default 4000).

Health check:

- `GET /api/health` → `{ ok, uptime, mongo }`

## Scripts

- `npm run dev` — run with ts-node-dev (auto-reload)
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run compiled server

## Structure

```
src/
  config/env.ts        # env parsing (zod)
  db/mongoose.ts       # mongo connect/disconnect
  middleware/error.ts  # not-found + error handler
  controllers/health.controller.ts
  routes/index.ts      # /api routes
  app.ts               # express app setup
  index.ts             # boot + graceful shutdown
```

## Next steps

- Add auth (JWT) and users collection
- Add product, category, order models + routes
- Request validation with Zod per route
- Logging (swap morgan for pino) if needed
- CORS: update `CORS_ORIGIN` in `.env` for production
