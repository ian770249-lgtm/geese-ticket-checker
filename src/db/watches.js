import db from "./index.js";

export function getAllWatches() {
  return db
    .prepare(`
      SELECT *
      FROM watches
      ORDER BY id ASC
    `)
    .all();
}

export function getEnabledWatches() {
  return db
    .prepare(`
      SELECT *
      FROM watches
      WHERE enabled = 1
      ORDER BY id ASC
    `)
    .all();
}

export function createWatch({ name, url, maxPrice, quantity }) {
  const result = db
    .prepare(`
      INSERT INTO watches (
        name,
        url,
        section_filter,
        max_price,
        quantity,
        enabled,
        alert_cooldown_minutes,
        created_at,
        updated_at
      )
      VALUES (?, ?, '', ?, ?, 1, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `)
    .run(
      name,
      url,
      maxPrice ?? null,
      quantity ?? 1
    );

  return db
    .prepare(`
      SELECT *
      FROM watches
      WHERE id = ?
    `)
    .get(result.lastInsertRowid);
}

export function updateWatchStatus(watchId, status) {
  return db
    .prepare(`
      UPDATE watches
      SET
        last_status = ?,
        last_checked_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(status, watchId);
}