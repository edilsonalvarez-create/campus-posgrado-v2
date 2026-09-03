const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || '';
const isLocal =
  !connectionString ||
  /@(localhost|127\.0\.0\.1|postgres|host\.docker\.internal)[:/]/.test(connectionString);

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: Number(process.env.PG_POOL_MAX) || 10,
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'campus_posgrado',
      max: Number(process.env.PG_POOL_MAX) || 10,
    });

pool.on('error', (err) => {
  console.error('[pg] idle client error:', err.message);
});

module.exports = pool;
