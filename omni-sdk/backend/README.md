# Omni Backend

This is the backend service for the Omni-SDK part of [Omni-optimize](omni-optimize.vercel.app) project. It is built with **Bun** and uses **Drizzle ORM** for database migrations. The backend also includes a background worker, which is started automatically when the main server starts, but can also be run separately if needed.

## Prerequisites

- [Bun](https://bun.sh/) installed (for local development)
- Node.js 20+ (optional if using Bun CLI only)
- PostgreSQL (for database)
- BullMQ with Redis (for background jobs)

---

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Environment Setup

Create a `.env` file (for development) based on `.env.example`:

```bash
cp .env.example .env
```

### Ensure the database is ready:

- Create the database if it doesn’t exist.

- Run the migrations:

```bash
bun run db:migrate
```

This sets up all necessary tables and schema for the backend to work.

Start the backend in development mode:

```bash
bun run dev
```

- The backend server will start with hot-reload.

- The worker will also start automatically in the background.
- Update any values if needed. This file will be used by Docker Compose and local dev environment.

---

## Scripts

| Script                 | Description                                                                       |
| ---------------------- | --------------------------------------------------------------------------------- |
| `bun run dev`          | Starts the backend in hot-reload mode for development.                            |
| `bun build`            | Builds the `index.ts` and `worker.ts` files into `dist/` directory.               |
| `bun start`            | Runs the compiled backend. The worker is automatically started in the background. |
| `bun run start:worker` | Starts the worker manually (optional).                                            |
| `bun run db:migrate`   | Runs Drizzle database migrations.                                                 |
| `bun run db:generate`  | Generates Drizzle ORM types from the database schema.                             |

> **Note:** The worker is automatically started when running `bun start` or `bun run dev`. If it fails to start, the backend will still run, so you can also run the worker separately using `start:worker`.

---

## Docker Setup (for development)

1. Build and start the services:

```bash
docker-compose up --build
```

This will start:

- `backend` service
- `postgres` service (database)
- `redis` service (for jobs)

2. Optional: Run database migrations manually:

```bash
docker-compose exec backend bun run db:migrate
```

---

## Project Structure

```
src/
├─ index.ts      # Main backend entrypoint (starts server + worker)
├─ worker.ts     # Background worker script
dist/             # Compiled JS output
```

---

## Notes

- **Development vs Production:**

  - Dev: `.env.docker` contains safe defaults, migrations can run automatically.
  - Prod: Secrets should be injected via environment variables; migrations are run manually.

- **Worker Behavior:**

  - The worker is started automatically in the background when the server starts.
  - If needed, it can be run separately using `bun run start:worker`.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes

4. Open a pull request
