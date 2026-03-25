import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// adjust this only if your database file lives somewhere else
const dbPath = path.join(__dirname, "../../data/app.db");

const db = new sqlite3.Database(dbPath);

function all(sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function run(sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function columnExists(tableName, columnName) {
  const rows = await all(`PRAGMA table_info(${tableName})`);
  return rows.some((row) => row.name === columnName);
}

async function main() {
  try {
    const hasLastStatus = await columnExists("watches", "last_status");
    const hasLastCheckedAt = await columnExists("watches", "last_checked_at");

    if (!hasLastStatus) {
      await run(`ALTER TABLE watches ADD COLUMN last_status TEXT`);
      console.log("Added column: watches.last_status");
    } else {
      console.log("Column already exists: watches.last_status");
    }

    if (!hasLastCheckedAt) {
      await run(`ALTER TABLE watches ADD COLUMN last_checked_at TEXT`);
      console.log("Added column: watches.last_checked_at");
    } else {
      console.log("Column already exists: watches.last_checked_at");
    }

    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

main();