# Tenant Platform API

Multi-tenant SaaS platform API built with NestJS. Provides authentication, tenant isolation, role-based access control, subscription plans with usage limits, rate limiting, and audit logging — all using raw SQL (no ORM).

## What it solves

Building a multi-tenant backend from scratch requires solving several cross-cutting concerns: tenant isolation, access control, usage limits, and observability. This API handles all of that in a single, cohesive system where tenants share a database but are logically isolated through middleware and guards.

## How it works

Every authenticated request flows through a guard chain:

```
Request → AuthGuard (JWT) → TenantGuard (x-tenant-id) → RateLimitGuard (Redis) → Controller
```

- **AuthGuard** verifies the JWT access token and attaches the user to the request.
- **TenantGuard** reads the `x-tenant-id` header, validates that the user belongs to the tenant, and attaches the tenant ID.
- **RateLimitGuard** checks Redis (`rate_limit:{tenant_id}`) against the tenant's plan limit (`max_requests_per_minute`).
- **RolesGuard / PermissionsGuard** (optional) enforce RBAC at the endpoint level.
- **AuditLogInterceptor** logs all mutations (POST/PATCH/DELETE) to the `audit_logs` table.

## Architecture

```
api/src/
├── common/              Shared guards, decorators, middleware, pipes, filters, interceptors
├── core/plsql/          PlsqlService — raw SQL query execution and transactions
├── infrastructure/
│   ├── config/          Environment configuration (@nestjs/config)
│   ├── database/        PostgreSQL connection pool (pg)
│   ├── logger/          Structured logger (pino)
│   └── redis/           Redis client (ioredis)
└── modules/
    ├── auth/            Register, login, JWT + refresh token rotation
    ├── tenants/         Tenant CRUD, user-tenant membership
    ├── roles/           Per-tenant roles, role assignment
    ├── permissions/     Global permissions, role-permission mapping
    ├── plans/           Plan CRUD (free, starter, pro, enterprise)
    ├── subscriptions/   Tenant subscriptions, plan changes, limit validation
    └── audit-logs/      Audit log queries and endpoints
```

### Key patterns

- **No ORM** — All database access uses raw parameterized SQL via `PlsqlService`. Queries live in `sql/*.sql.ts` enum files. Repositories wrap `PlsqlService` calls and return typed results.
- **Shared database multi-tenancy** — All tenants share the same database. Isolation is enforced at the application layer through the `TenantGuard` and `tenant_id` foreign keys.
- **Repository pattern** — Each module has `repositories/`, `sql/`, `types/`, and `dto/` directories. Services contain business logic, repositories handle data access, DTOs validate input at the controller level only.
- **Guard chain** — Guards compose declaratively via `@UseGuards(AuthGuard, TenantGuard, RateLimitGuard)`. Each guard adds context to the request object.
- **Soft deletes** — Tables use `deleted_at` columns instead of hard deletes.
- **Correlation ID** — Every request gets an `x-correlation-id` header (generated or propagated), logged in audit entries for traceability.

## Tech stack

| Layer          | Technology                |
|----------------|---------------------------|
| Framework      | NestJS                    |
| Language       | TypeScript (ESM)          |
| Database       | PostgreSQL (raw SQL, pg)  |
| Cache          | Redis (ioredis)           |
| Auth           | JWT + bcrypt              |
| Logger         | Pino                      |
| Security       | Helmet                    |
| Validation     | class-validator           |
| Testing        | Jest                      |
| CI             | GitHub Actions            |

## Database schema

5 migrations in `database/migrations/`:

| Migration | Tables |
|-----------|--------|
| 001 | `users`, `refresh_tokens` |
| 002 | `tenants`, `user_tenants` |
| 003 | `roles`, `permissions`, `role_permissions` |
| 004 | `plans`, `subscriptions` |
| 005 | `audit_logs` |

## API endpoints

### Auth (`/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get tokens |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Revoke refresh token |

### Tenants (`/tenants`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/tenants` | Create tenant (seeds default roles) |
| GET | `/tenants` | List user's tenants |
| POST | `/tenants/users` | Add user to tenant (validates plan user limit) |

### Roles (`/roles`) — requires `x-tenant-id`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/roles` | Create role |
| GET | `/roles` | List tenant roles |
| POST | `/roles/assign` | Assign role to user |
| DELETE | `/roles/:id` | Delete role |

### Permissions (`/permissions`) — requires `x-tenant-id`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/permissions` | Create permission |
| GET | `/permissions` | List all permissions |
| POST | `/permissions/role` | Add permission to role |
| DELETE | `/permissions/role` | Remove permission from role |
| GET | `/permissions/role/:roleId` | List role permissions |
| GET | `/permissions/user` | List current user's permissions |
| DELETE | `/permissions/:id` | Delete permission |

### Plans (`/plans`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/plans` | Create plan |
| GET | `/plans` | List all plans |
| GET | `/plans/:id` | Get plan |
| PATCH | `/plans/:id` | Update plan |
| DELETE | `/plans/:id` | Delete plan |

### Subscriptions (`/subscriptions`) — requires `x-tenant-id`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/subscriptions` | Subscribe tenant to plan |
| POST | `/subscriptions/change` | Change plan |
| GET | `/subscriptions` | Get active subscription |
| DELETE | `/subscriptions` | Cancel subscription |

### Audit Logs (`/audit-logs`) — requires `x-tenant-id`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/audit-logs` | List tenant audit logs |
| GET | `/audit-logs/me` | List current user's audit logs |

## Getting started

### Prerequisites

- Node.js 22+
- PostgreSQL
- Redis

### Setup

```bash
cd api
npm install
```

Configure `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=tenant_admin
DB_PASSWORD=tenant_secret
DB_NAME=tenant_platform
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-here
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d
```

Run migrations against your database, then:

```bash
npm run start:dev
```

### Tests

```bash
npm test
```

50 unit tests covering auth, plans, subscriptions, rate limiting, and error handling.

## Project structure

The project was built incrementally across 8 phases:

1. **Base** — NestJS setup, PlSQL service, Docker, CI
2. **Auth** — JWT authentication, refresh token rotation
3. **Multi-tenancy** — Tenant creation, user-tenant membership
4. **RBAC** — Roles, permissions, guards and decorators
5. **Plans** — Subscription plans with usage limits
6. **Rate Limiting** — Redis-based per-tenant rate limiting
7. **Logs** — Audit logs, structured logging, correlation IDs
8. **Hardening** — Global error handling, helmet, validation, tests
