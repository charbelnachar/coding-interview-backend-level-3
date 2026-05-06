# Items API — Backend Level 3

REST API for managing items with a full audit history log, built with Node.js, Express, Prisma, and PostgreSQL.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| ORM | Prisma 5 + PostgreSQL 16 |
| Language | TypeScript 5 (strict mode) |
| Tests | Jest 29 + supertest |
| Linter / Formatter | Biome |
| Containers | Docker + Docker Compose |

---

## Project Structure

```
.
├── src/
│   ├── index.ts                        # Entry point — starts the server
│   ├── server.ts                       # Express app bootstrap + test adapter
│   ├── routes.ts                       # Root router — aggregates all module routers
│   ├── config/
│   │   ├── index.ts                    # loadConfig() — reads process.env
│   │   └── dependency-factory.ts       # Root DI aggregator — wires all modules
│   ├── common/
│   │   ├── exceptions/
│   │   │   ├── not-found.exception.ts  # NotFoundException (404)
│   │   │   └── validation.exception.ts # ValidationException (400)
│   │   ├── interfaces/
│   │   │   ├── auth-validator.interface.ts
│   │   │   ├── item-repository.interface.ts
│   │   │   ├── logger.interface.ts
│   │   │   └── validation-error.interface.ts
│   │   └── middlewares/
│   │       ├── auth-middleware.ts       # Auth validator + middleware + factory
│   │       └── error-handler.middleware.ts
│   ├── database/
│   │   ├── db.ts                       # Prisma singleton + connect/disconnect
│   │   └── seeds/seed.ts               # Initial data (RUN_SEED=true)
│   ├── health/
│   │   ├── health.routes.ts            # GET /health
│   │   ├── health.factory.ts           # Wires health check functions
│   │   └── checks/
│   │       ├── database.check.ts
│   │       ├── items.check.ts
│   │       └── history.check.ts
│   └── modules/
│       ├── items/
│       │   ├── item.routes.ts          # Express Router — CRUD /items
│       │   ├── item.service.ts
│       │   ├── item.repository.ts      # Prisma implementation
│       │   ├── item.validator.ts       # Manual validation (no schema lib)
│       │   └── items.factory.ts        # Creates ItemService (real or in-memory)
│       └── history/
│           ├── history.service.ts      # Prisma implementation of ILogger
│           └── history.factory.ts      # Creates HistoryService (real or in-memory)
├── test/
│   ├── unit/                           # Pure unit tests (jest.fn() mocks inline)
│   │   ├── items/
│   │   ├── middlewares/
│   │   └── config/
│   └── integration/                    # Tests against in-memory deps via initializeServer()
│       ├── items/
│       ├── health/
│       └── history/
├── e2e/
│   └── index.test.ts                   # End-to-end tests — DO NOT MODIFY
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       └── 20260505133601_init/
│           └── migration.sql           # Initial schema — mounted in postgres on first start
├── docker-compose.yml
├── Dockerfile
├── biome.json
└── tsconfig.build.json                 # Production build (excludes test files)
```

---

## Code Conventions

### File naming

`kebab-case.type.ts` — the type suffix signals the file's role:

| Suffix | Role |
|---|---|
| `.routes.ts` | Express Router factory |
| `.service.ts` | Business logic |
| `.repository.ts` | Data access (Prisma) |
| `.factory.ts` | Dependency factory |
| `.validator.ts` | Input validation |
| `.middleware.ts` | Express middleware |
| `.check.ts` | Health check function |
| `.interface.ts` | TypeScript contract |
| `.exception.ts` | Domain exception class |

### TypeScript naming

| Construct | Convention | Example |
|---|---|---|
| Classes | `PascalCase` | `ItemService` |
| Interfaces | `PascalCase` with `I` prefix | `IItemRepository` |
| Functions | `camelCase` | `createItemDependencies` |
| Variables / properties | `camelCase` | `itemService` |
| Types / enums | `PascalCase` | `AppDependencies` |

### Dependency injection

Each module owns a `*.factory.ts` that creates its own dependencies. The root `dependency-factory.ts` assembles all module factories into `AppDependencies`. The server receives `AppDependencies` and passes the relevant pieces to each router factory.

In **test mode** (`NODE_ENV=test`), every factory returns in-memory stubs — no database connection is needed. In **production mode**, real Prisma-backed implementations are used.

### Documentation

Public exported functions carry JSDoc in Google format (English):

```ts
/**
 * Short description.
 *
 * Args:
 *   param: Description.
 *
 * Returns:
 *   Description of return value.
 */
export function example(param: string): string { ... }
```

Internal helpers and route handlers do not require JSDoc.

### Linting and formatting

[Biome](https://biomejs.dev/) handles both lint and format. Config lives in `biome.json`.

### Recent refactoring

**File consolidation & cleanup:**
- **Auth consolidated**: Three files (`auth.middleware.ts`, `auth.factory.ts`, `auth.validator.ts`) merged into single `auth-middleware.ts` — cleaner structure, same functionality
- **Auth relocated**: Moved from `modules/auth/` → `common/middlewares/` — auth is middleware infrastructure, not a business module
- **Clean imports**: `ValidationError` interface centralized in `common/interfaces/` to prevent layering violations

**Infrastructure improvements:**
- **Docker composition**: Dev container references root `docker-compose.yml` + minimal override — single source of truth for services, network, volumes
- **Gitignore cleaned**: Added `.claude/`, removed duplicate entries, removed incorrect patterns

---

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` |
| `HOST` | Bind address | `0.0.0.0` |
| `PORT` | HTTP port | `3000` |
| `DATABASE_URL` | Full Prisma connection string | Built from DB_* vars |
| `DB_HOST` | Postgres host | `db` |
| `DB_PORT` | Postgres port | `5432` |
| `DB_USERNAME` | Postgres user | `postgres` |
| `DB_PASSWORD` | Postgres password | `postgres` |
| `DB_NAME` | Postgres database name | `items_db` |
| `POSTGRES_USER` | Postgres container user | `postgres` |
| `POSTGRES_PASSWORD` | Postgres container password | `postgres` |
| `POSTGRES_DB` | Postgres container db name | `items_db` |
| `RUN_SEED` | Seed items on startup | `true` |

---

## Getting Started

### With Docker Compose (recommended)

```bash
# 1. Copy environment config
cp .env.example .env

# 2. Build images and start services
docker compose up --build

# 3. Verify
curl http://localhost:3000/ping    # → {"ok":true}
curl http://localhost:3000/health  # → {"status":"ok",...}
```

The database schema is applied automatically via `/docker-entrypoint-initdb.d/init.sql` (mounted from `prisma/migrations/.../migration.sql`) on the first volume creation.

### With Dev Container (VS Code)

Open the folder in VS Code and select **Reopen in Container**. The post-create command runs `npm ci && npx prisma generate` automatically.

### Local development (no Docker)

```bash
npm install
npx prisma generate
cp .env.example .env      # set DB_HOST=localhost, adjust passwords as needed
npm run dev
```

---

## Database Migrations

Migrations are **always manual** — the server never runs them automatically.

```bash
# Create a new migration (dev only — requires a running DB)
npm run db:migrate:dev -- --name <migration-name>

# Apply pending migrations (production / CI)
npm run db:migrate

# Regenerate the Prisma client after schema changes
npm run db:generate

# Seed initial data manually
npm run db:seed
```

---

## API Endpoints

| Method | Path | Description | Status |
|---|---|---|---|
| `GET` | `/ping` | Liveness check | 200 |
| `GET` | `/health` | Health of all modules | 200 / 503 |
| `GET` | `/items` | List all items | 200 |
| `POST` | `/items` | Create an item | 201 / 400 |
| `GET` | `/items/:id` | Get item by ID | 200 / 404 |
| `PUT` | `/items/:id` | Update item by ID | 200 / 400 / 404 |
| `DELETE` | `/items/:id` | Delete item by ID | 204 / 404 |

### Health response

```json
{
  "status": "ok",
  "database": "connected",
  "checks": {
    "database": "ok",
    "items": "ok",
    "history": "ok"
  }
}
```

Returns `503` with `"status": "error"` if any check fails, reporting which modules are down.

---

## Tests

```bash
npm test                  # e2e tests only
npm run test:unit         # unit tests
npm run test:integration  # integration tests (in-memory deps, no DB required)
npm run test:all          # all suites
```

**e2e tests** (`e2e/index.test.ts`) must not be modified — they serve as the acceptance contract.

**Integration tests** run against in-memory repositories and services (no database required). They use the same `initializeServer()` entry point as the e2e tests.

**Unit tests** use `jest.fn()` inline mocks — no dedicated mock class files.

---

## Linting and Git Hooks

```bash
npm run check       # lint + format check
npm run check:fix   # lint + format with auto-fix
npm run lint        # lint only
npm run format      # format only
```

Git hooks (managed by **husky**):

- **pre-commit** — runs `biome check --write` on staged files via `lint-staged`
- **pre-push** — runs the full test suite (`npm run test:all`)

---

## Project Audit

### What was removed

| Item | Reason |
|------|--------|
| `src/modules/auth/` | Auth moved to middleware; not a business module |
| `src/common/middlewares/auth.middleware.ts` | Consolidated into `auth-middleware.ts` |
| `src/common/middlewares/auth.factory.ts` | Consolidated into `auth-middleware.ts` |
| `src/common/middlewares/auth.validator.ts` | Consolidated into `auth-middleware.ts` |
| `.devcontainer/docker-compose.yml` | Now uses root `docker-compose.yml` + override |

### What was added / reorganized

| Item | Purpose |
|------|---------|
| `src/common/middlewares/auth-middleware.ts` | Single file: validator + factory + middleware |
| `src/common/interfaces/validation-error.interface.ts` | Prevent cross-layer imports |
| `.devcontainer/docker-compose.override.yml` (updated) | Dev-only overrides (builder target, sleep infinity) |
| `.gitignore` (updated) | Added `.claude/`, cleaned up patterns |

### Structure verification

✅ **Middlewares** (2 files):
- `auth-middleware.ts` — Auth validator + factory + middleware
- `error-handler.middleware.ts` — Global error handling

✅ **Modules** (2 folders):
- `items/` — CRUD service + routes
- `history/` — Audit log service

✅ **No broken imports** — all tests pass (unit, integration, e2e)
