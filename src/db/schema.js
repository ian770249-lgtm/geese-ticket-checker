export function initSchema(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS watches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      section_filter TEXT,
      max_price INTEGER,
      quantity INTEGER DEFAULT 1,
      enabled INTEGER NOT NULL DEFAULT 1,
      alert_cooldown_minutes INTEGER NOT NULL DEFAULT 60,
      last_status TEXT,
      last_checked_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS check_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      watch_id INTEGER NOT NULL,
      checked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL,
      message TEXT,
      matched_count INTEGER NOT NULL DEFAULT 0,
      cheapest_price INTEGER,
      FOREIGN KEY (watch_id) REFERENCES watches(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      watch_id INTEGER NOT NULL,
      sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      alert_type TEXT NOT NULL DEFAULT 'tickets_available',
      message TEXT,
      match_hash TEXT NOT NULL,
      email TEXT NOT NULL,
      FOREIGN KEY (watch_id) REFERENCES watches(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_check_results_watch_id
      ON check_results(watch_id);

    CREATE INDEX IF NOT EXISTS idx_alerts_watch_id
      ON alerts(watch_id);
  `);
}