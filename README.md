# RecallAI

> AI-powered memory infrastructure platform. Ingest content → AI generates Active Recall flashcards → FSRS v4 schedules optimal review.

**Version:** 0.1.0-alpha · **Status:** Internal — Engineering Reference

This is the RecallAI monorepo. It is built per the **RecallAI Master Implementation Prompt v1.0** and the **Engineering Handbook (Volumes I–VIII)**.

## Monorepo Layout

```
recallai/
├── apps/
│   ├── web/      # Next.js 14 (App Router) PWA frontend
│   ├── api/      # NestJS v10 API service
│   └── worker/   # BullMQ worker service
├── packages/
│   ├── shared/   # Shared types, constants, Zod validation schemas
│   └── tsconfig/ # Shared TypeScript configs
├── infra/        # Terraform infrastructure-as-code
└── .github/      # GitHub Actions CI/CD
```

## Tech Stack (Locked — PROMPT §3)

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14 (App Router), TypeScript 5 (strict), Tailwind v3 + OKLCH, Radix UI, Zustand, TanStack Query |
| API | NestJS v10, Prisma v5, PostgreSQL 16 + pgvector, Redis 7 |
| Worker | Node.js 22, BullMQ, ts-fsrs, pdf-parse, OpenAI + Anthropic (behind `AIGateway`) |
| Infra | AWS (ECS Fargate, RDS, SQS, S3, ElastiCache), Terraform |

## Prerequisites

- **Node.js** 22 LTS (see `.nvmrc`)
- **pnpm** ≥ 9 (`corepack enable`)
- **Docker** + **Docker Compose** (for local Postgres + Redis)

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env templates (fill in secrets before running)
cp apps/api/.env.example      apps/api/.env
cp apps/worker/.env.example   apps/worker/.env
cp apps/web/.env.example      apps/web/.env

# 3. Start local Postgres 16 (+ pgvector) and Redis 7
docker compose up -d

# 4. Apply database schema + run migration
pnpm db:migrate

# 5. Generate Prisma client
pnpm db:generate

# 6. Start all services in dev mode
pnpm dev
```

| Service | URL |
| --- | --- |
| Web | http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| API health | http://localhost:3001/health |

## Common Scripts

```bash
pnpm build          # Build all workspaces (via Turborepo)
pnpm dev            # Start web + api + worker in watch mode
pnpm lint           # ESLint across the workspace
pnpm typecheck      # tsc --noEmit across the workspace
pnpm test           # Unit + integration tests
pnpm test:e2e       # Playwright E2E (web) + Supertest E2E (api)
pnpm db:migrate     # Create/apply a Prisma migration
pnpm db:studio      # Open Prisma Studio against local DB
```

## Conventions (PROMPT §12)

- **Files:** kebab-case (`auth.service.ts`, `deck-list.tsx`)
- **Classes:** PascalCase (`AuthService`) · **Functions:** camelCase (`getUserDecks`)
- **Constants:** SCREAMING_SNAKE_CASE · **DB columns:** snake_case (via Prisma `@@map`)
- TypeScript is `strict: true` everywhere. No `any`. No type assertions without a safety comment.
- Max 300 lines/file, 50 lines/function.

## Non-Negotiable Rules (PROMPT §15)

- Never store tokens/secrets in `localStorage`, `sessionStorage`, or committed `.env`.
- Never call OpenAI/Anthropic SDKs outside `ai-gateway.service.ts`.
- Never query the DB without `user_id` in the WHERE clause (tenant isolation).
- Never use HS256 for JWTs (use RS256) or MD5/SHA1 for passwords (use bcrypt cost 12).
- Never block the review session on a network request.

## License

Proprietary — RecallAI Confidential. All rights reserved.
