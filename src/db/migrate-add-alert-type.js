import db from "./index.js";

function columnExists(tableName, columnName) {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return rows.some((row) => row.name === columnName);
}

function main() {
  try {
    const hasAlertType = columnExists("alerts", "alert_type");

    if (!hasAlertType) {
      db.prepare(`
        ALTER TABLE alerts
        ADD COLUMN alert_type TEXT NOT NULL DEFAULT 'tickets_available'
      `).run();

      console.log("Added column: alerts.alert_type");
    } else {
      console.log("Column already exists: alerts.alert_type");
    }

    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exitCode = 1;
  }
}

main();