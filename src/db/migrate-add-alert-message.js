import db from "./index.js";

function columnExists(tableName, columnName) {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return rows.some((row) => row.name === columnName);
}

function main() {
  try {
    const hasMessage = columnExists("alerts", "message");

    if (!hasMessage) {
      db.prepare(`
        ALTER TABLE alerts
        ADD COLUMN message TEXT
      `).run();

      console.log("Added column: alerts.message");
    } else {
      console.log("Column already exists: alerts.message");
    }

    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exitCode = 1;
  }
}

main();