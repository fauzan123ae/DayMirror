import pool from './index.js';

const sql = `
  CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    goal       TEXT,
    streak     INTEGER DEFAULT 0,
    ai_companion JSONB DEFAULT '{"name":"Mirror","avatar":"🥑"}',
    stickers   JSONB DEFAULT '[{"id":1,"emoji":"🎉","x":80,"y":15,"rotate":-15,"label":"Super!"},{"id":2,"emoji":"✨","x":20,"y":70,"rotate":10,"label":"Ajaib"},{"id":3,"emoji":"🌸","x":92,"y":78,"rotate":-5,"label":"Damai"}]',
    joined_at  DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS reflections (
    id           BIGSERIAL PRIMARY KEY,
    user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    date         DATE NOT NULL,
    mood         TEXT NOT NULL DEFAULT 'neutral',
    good_things  TEXT,
    obstacles    TEXT,
    tomorrow_goal TEXT,
    ai_summary   TEXT,
    ai_advice    TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
  );

  CREATE TABLE IF NOT EXISTS weekly_reports (
    id             BIGSERIAL PRIMARY KEY,
    user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    date_generated TEXT,
    achievements   JSONB,
    challenges     JSONB,
    trends         TEXT,
    recommendations JSONB,
    created_at     TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS daily_goals (
    id         BIGSERIAL PRIMARY KEY,
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    date       DATE NOT NULL DEFAULT CURRENT_DATE,
    items      JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
  );
`;

async function migrate() {
  try {
    await pool.query(sql);
    console.log('✅ Migration selesai!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration gagal:', err);
    process.exit(1);
  }
}

migrate();
