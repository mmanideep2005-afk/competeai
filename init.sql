CREATE TABLE IF NOT EXISTS reports (
  id            SERIAL PRIMARY KEY,
  company       TEXT NOT NULL,
  report_md     TEXT,
  analysis      TEXT,
  raw_research  TEXT,
  quality_score REAL,
  status        TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
