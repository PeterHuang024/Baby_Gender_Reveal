CREATE TABLE IF NOT EXISTS votes (
  voter_id TEXT PRIMARY KEY NOT NULL,
  choice TEXT NOT NULL CHECK (choice IN ('boy', 'girl')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_votes_choice ON votes(choice);
