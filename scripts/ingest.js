const fs = require('fs');
const readline = require('readline');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const crypto = require('crypto');

const jsonlFilePath = 'C:\\Users\\visht\\olj_profiles.jsonl';
const dbPath = path.join(__dirname, '..', 'dev.db');

async function ingestData() {
  console.log(`Starting ingestion from ${jsonlFilePath}...`);
  
  if (!fs.existsSync(jsonlFilePath)) {
    console.error(`Error: File not found at ${jsonlFilePath}`);
    process.exit(1);
  }

  // Open database with promise-wrapper for safe throttling
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable PRAGMAs for massive bulk insert speed
  await db.exec('PRAGMA synchronous = OFF');
  await db.exec('PRAGMA journal_mode = MEMORY');
  
  // Create FTS5 virtual table
  await db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS CandidateFTS USING fts5(
      id UNINDEXED,
      title,
      description,
      skills,
      tokenize='trigram'
    )
  `);

  console.log('FTS table ensured. Beginning data stream...');
  await startStream(db);
}

async function startStream(db) {
  const fileStream = fs.createReadStream(jsonlFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  const BATCH_SIZE = 5000;

  console.log('Reading file line by line...');
  
  // We use the underlying driver for prepared statements
  const insertCandidateStmt = await db.prepare(`
    INSERT OR IGNORE INTO Candidate (id, oljId, title, description, skills, rateRaw, lastActive, profileUrl, otherDetailsJson, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  
  const insertFtsStmt = await db.prepare(`
    INSERT INTO CandidateFTS (id, title, description, skills)
    VALUES (?, ?, ?, ?)
  `);

  await db.exec('BEGIN TRANSACTION');

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const candidate = JSON.parse(line);
      const id = crypto.randomUUID();
      
      const title = candidate.title || '';
      const desc = candidate.description || '';
      const skills = Array.isArray(candidate.skills) ? candidate.skills.join(', ') : (candidate.skills || '');
      const rateRaw = candidate.rate || '';
      const lastActive = candidate.last_active || candidate.lastActive || '';
      const profileUrl = candidate.profile_url || candidate.url || '';
      const oljId = candidate.id || candidate.oljId || null;
      const otherDetails = JSON.stringify(candidate.other_details || candidate.details || {});

      // Await prevents the node event loop queue from exploding on 4 million rows
      const res = await insertCandidateStmt.run(id, oljId, title, desc, skills, rateRaw, lastActive, profileUrl, otherDetails);
      
      // If changes > 0, it means it wasn't ignored due to unique constraint on oljId
      if (res.changes > 0) {
        await insertFtsStmt.run(id, title, desc, skills);
        count++;
        
        if (count % BATCH_SIZE === 0) {
          await db.exec('COMMIT');
          await db.exec('BEGIN TRANSACTION');
          console.log(`Ingested ${count} new records...`);
        }
      }
    } catch (err) {
      console.error(`Error parsing line ${count}:`, err.message);
    }
  }

  await db.exec('COMMIT');
  await insertCandidateStmt.finalize();
  await insertFtsStmt.finalize();
  await db.close();

  console.log(`Ingestion complete! Total records processed: ${count}`);
}

ingestData().catch(e => {
  console.error(e);
  process.exit(1);
});
