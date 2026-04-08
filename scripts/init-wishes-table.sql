-- Run once in Neon (or any Postgres-compatible) SQL editor after creating the database.
-- The board_id column lets multiple boards share a single database.
CREATE TABLE IF NOT EXISTS wishes (
  id            TEXT PRIMARY KEY,
  board_id      TEXT NOT NULL DEFAULT 'default',
  name          TEXT NOT NULL,
  message       TEXT NOT NULL,
  image         TEXT,
  card_color    TEXT,
  illustration  TEXT,
  timestamp     BIGINT NOT NULL,
  reactions     INTEGER NOT NULL DEFAULT 0,
  reaction_breakdown JSONB
);

CREATE INDEX IF NOT EXISTS idx_wishes_board_id ON wishes (board_id);

-- If upgrading an existing table, add the column:
-- ALTER TABLE wishes ADD COLUMN IF NOT EXISTS board_id TEXT NOT NULL DEFAULT 'default';
-- CREATE INDEX IF NOT EXISTS idx_wishes_board_id ON wishes (board_id);
