// Runner de migraciones idempotente. Aplica backend/db/migrations/*.sql en orden,
// registrando lo aplicado en la tabla _migrations. Seguro de ejecutar en cada arranque.
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

const DIR = path.join(__dirname, 'migrations');

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    const applied = new Set(
      (await client.query('SELECT name FROM _migrations')).rows.map((r) => r.name),
    );
    const files = fs
      .readdirSync(DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = fs.readFileSync(path.join(DIR, file), 'utf8');
      process.stdout.write(`[migrate] aplicando ${file} ... `);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log('ok');
        ran++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.log('FALLÓ');
        throw err;
      }
    }
    console.log(ran ? `[migrate] ${ran} migración(es) aplicada(s).` : '[migrate] nada que aplicar.');
  } finally {
    client.release();
  }
}

if (require.main === module) {
  run()
    .then(() => pool.end())
    .catch((err) => {
      console.error('[migrate] error:', err.message);
      process.exit(1);
    });
}

module.exports = run;
