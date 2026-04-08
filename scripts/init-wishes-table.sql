-- Run once in Neon (or any Postgres-compatible) SQL editor after creating the database.
CREATE TABLE IF NOT EXISTS wishes (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  message       TEXT NOT NULL,
  image         TEXT,
  card_color    TEXT,
  illustration  TEXT,
  timestamp     BIGINT NOT NULL,
  reactions     INTEGER NOT NULL DEFAULT 0,
  reaction_breakdown JSONB
);
