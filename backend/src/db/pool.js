import pg from 'pg';

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/x7cyber';

export const pool = new Pool({
  connectionString,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
});

export const query = (text, params) => pool.query(text, params);

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error', err);
});
