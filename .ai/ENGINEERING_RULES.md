# Engineering Rules — RecallAI

## Naming Conventions
- **Files:** kebab-case (`auth.service.ts`, `deck-list.tsx`)
- **Classes:** PascalCase (`AuthService`)
- **Functions:** camelCase (`getUserDecks`)
- **Constants:** SCREAMING_SNAKE_CASE
- **DB columns:** snake_case (via Prisma `@@map`)
- **Routing:** App Router file-based (`(auth)/login/page.tsx`)

## Code Style
- TypeScript `strict: true` everywhere. No `any`. No type assertions without a `// safety` comment.
- Max 300 lines/file, 50 lines/function.
- Use `import type { X }` for type-only imports.
- File extensions in source imports: `.js` (TypeScript outputs `.js`, keep source consistent).
- Prettier for formatting (`pnpm format`).

## Project Structure
- **Monorepo:** Turborepo with `apps/` (web, api, worker) and `packages/` (shared, tsconfig).
- **API:** NestJS modules under `src/modules/<name>/` with `*.module.ts`, `*.controller.ts`, `*.service.ts`, plus `guards/`, `decorators/`, `strategies/`, `services/` subdirectories.
- **Web:** Next.js 14 App Router — route groups `(auth)`, `(app)`, feature directories under `app/`.
- **Shared:** `@recallai/shared` package for types, constants, Zod schemas. No package boundary violations.
- **Worker:** BullMQ processors in `apps/worker/`.

## Tech Stack (Locked)
| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript 5 strict, Tailwind v3 + OKLCH, Radix UI, Zustand, TanStack Query |
| API | NestJS v10, Prisma v5, PostgreSQL 16 + pgvector, Redis 7 |
| Worker | Node.js 22, BullMQ, ts-fsrs, pdf-parse, OpenAI + Anthropic (behind `AIGateway`) |
| Infra | AWS (ECS Fargate, RDS, SQS, S3, ElastiCache), Terraform |

## Security (Non-Negotiable)
- Never store tokens/secrets in `localStorage`, `sessionStorage`, or committed `.env`.
- Never call OpenAI/Anthropic SDKs outside `ai-gateway.service.ts`.
- Never query the DB without `user_id` in the WHERE clause (tenant isolation).
- Use RS256 for JWTs (never HS256). Use bcrypt cost 12 for passwords (never MD5/SHA1).
- Never block the review session on a network request.
- Refresh tokens are opaque UUIDs, bcrypt-hashed, rotated per use with family revocation on theft detection.
- Enumeration resistance: login/forgot-password never reveals whether an email exists.

## API Patterns
- Endpoints: `/api/v1/<resource>` prefix.
- Zod validation via `ZodValidationPipe`.
- Global `request-id` middleware for traceability.
- `GlobalExceptionFilter` for consistent error responses with `ErrorCode` from `@recallai/shared`.
- Use `@Public()` decorator for unauthenticated routes, `JwtAuthGuard` by default.

## Database
- Prisma ORM with PostgreSQL 16 + pgvector extension.
- Migrations via `pnpm db:migrate`.
- All queries scoped by `user_id` — never read/write rows across tenant boundaries.

## Commands
```bash
pnpm build          # Build all workspaces
pnpm dev            # Start web + api + worker in watch mode
pnpm lint           # ESLint across workspace
pnpm typecheck      # tsc --noEmit across workspace
pnpm test           # Unit + integration tests
pnpm test:e2e       # Playwright E2E (web) + Supertest E2E (api)
pnpm db:migrate     # Create/apply Prisma migration
```
