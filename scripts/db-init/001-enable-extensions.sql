-- RecallAI — PostgreSQL extensions (PROMPT §3 Database extensions).
-- Runs once on first container init (mounted into /docker-entrypoint-initdb.d).
-- pgvector:     1536-dim embeddings for semantic search / grounding.
-- uuid-ossp:    uuid_generate_v4() (Prisma uses gen_random_uuid() but the
--                extension is enabled for parity with §3 + future use).
-- pg_trgm:      trigram similarity for fuzzy card search (§12).
-- pg_stat_statements: query observability (already preloaded in compose).

CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Sanity log line visible in `docker compose logs postgres`.
DO $$
BEGIN
  RAISE NOTICE 'RecallAI extensions ready: pgvector, uuid-ossp, pg_trgm, pg_stat_statements';
END $$;
