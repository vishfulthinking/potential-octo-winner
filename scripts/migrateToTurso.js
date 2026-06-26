const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');

const localDb = new Database('./dev.db', { readonly: true });

const turso = createClient({
  url: 'libsql://hiringplatform-mycodeprojects.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI0MzQ2MDIsImlkIjoiMDE5ZjAxNjEtNTgwMS03Mzc0LWE2MzYtMmQxM2ViNGI1MGJhIiwicmlkIjoiYzg2YTdjNTgtNzBkYi00ODhiLTg2OGEtMjdhNDdkZTA1ZTM4In0.eS0n826Tf2O6LnJiPoaz-E1OHq18wY3-ixkgrjcDALXoYHrBOHfRnuLcwSJ0m1LPy6Sh0uG1enUApYFUTsVcCA'
});

async function migrate() {
  console.log("Starting migration to Turso...");

  // 1. Get schema from local DB and apply to Turso (except triggers)
  console.log("Fetching local schema...");
  const tables = localDb.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  
  console.log("Applying schema to Turso...");
  for (const table of tables) {
    if (table.sql && !table.name.includes('_data') && !table.name.includes('_idx') && !table.name.includes('_docsize') && !table.name.includes('_config')) {
      try {
        await turso.execute(table.sql);
      } catch(e) {
        // Ignore if already exists
      }
    }
  }

  // 2. Migrate data table by table
  const tableNames = ['User', 'Session', 'Account', 'UnlockedProfile', 'Candidate'];

  for (const tableName of tableNames) {
    console.log(`Migrating table ${tableName}...`);
    let count;
    try {
      count = localDb.prepare(`SELECT COUNT(*) as c FROM "${tableName}"`).get().c;
    } catch(e) {
      continue; // Table might not exist locally
    }
    
    console.log(`Total records in ${tableName}: ${count}`);
    if (count === 0) continue;

    const BATCH_SIZE = 500;
    let offset = 0;

    while (offset < count) {
      const rows = localDb.prepare(`SELECT * FROM "${tableName}" LIMIT ? OFFSET ?`).all(BATCH_SIZE, offset);
      if (rows.length === 0) break;

      const columns = Object.keys(rows[0]);
      
      const statements = rows.map(row => {
        return {
          sql: `INSERT OR IGNORE INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
          args: columns.map(c => row[c] === null ? null : row[c])
        };
      });

      try {
        await turso.batch(statements, 'write');
      } catch (err) {
        console.error(`Error batch inserting at offset ${offset} for ${tableName}:`, err.message);
        await new Promise(r => setTimeout(r, 2000)); // Sleep on error
      }

      offset += rows.length;
      if (offset % 5000 === 0 || offset === count) {
        console.log(`Migrated ${offset} / ${count} records for ${tableName}...`);
      }
    }
  }

  // 3. Rebuild FTS index directly on Turso server to save massive network bandwidth!
  console.log("Building FTS indexes on Turso...");
  try {
    await turso.execute(`INSERT INTO CandidateFTS(rowid, title, description, skills) SELECT id, title, description, skills FROM Candidate`);
    console.log("FTS index built successfully!");
  } catch (e) {
    console.error("FTS index build error:", e.message);
  }

  // 4. Apply triggers now
  console.log("Applying triggers...");
  const triggers = localDb.prepare("SELECT sql FROM sqlite_master WHERE type='trigger'").all();
  for (const trigger of triggers) {
    if (trigger.sql) {
      try {
        await turso.execute(trigger.sql);
      } catch(e) {}
    }
  }

  console.log("Migration complete!");
}

migrate().catch(console.error);
