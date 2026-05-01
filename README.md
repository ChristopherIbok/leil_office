# LEILPORTAL

Secure SaaS collaboration platform for remote teams and client-facing delivery.

## Monorepo

- `apps/api`: NestJS REST API, Prisma, JWT auth, RBAC, Socket.io chat gateway.
- `apps/web`: Next.js, TypeScript, TailwindCSS, Zustand, workspace UI.
- `packages/types`: shared role/status contracts.
- `infra/k8s`: starter Kubernetes deployment manifests.

## Phase 1 Scope Started

- Auth endpoints: `POST /api/auth/register`, `POST /api/auth/login`
- Users: `GET /api/users`, `GET /api/users/:id`
- Projects: `POST /api/projects`, `GET /api/projects`, `GET /api/projects/:id`, `PATCH /api/projects/:id`, `DELETE /api/projects/:id`
- Tasks: `POST /api/tasks`, `GET /api/tasks?projectId=`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`
- Chat: channels, persisted messages, Socket.io namespace at `/chat`
- Phase 2/3 foundations: files, time logs, invoices

## Local Setup

1. Install Node.js 20+ and pnpm.
2. Copy `.env.example` to `.env` and set `JWT_SECRET`.
   Also provide AWS variables when using S3 storage:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_S3_BUCKET`
   - `AWS_S3_ENDPOINT` (optional for custom S3-compatible endpoints)
3. Start Postgres:

```bash
docker compose up -d postgres
```

4. Install dependencies and prepare Prisma:

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
```

5. Run the apps:

```bash
pnpm dev:api
pnpm dev:web
```

The API listens on `http://localhost:4000/api`; the web app listens on `http://localhost:3000`.

## Production Notes

- Replace local JWT secrets with a managed secret store.
- Move file upload from record creation to signed S3 upload URLs before enabling public uploads.
- Add refresh tokens, audit logs, tenant isolation, e2e tests, and CI policy checks before launch.
- Kubernetes manifests are starters; add ingress, autoscaling, resource limits, and managed Postgres/S3 bindings per environment.
