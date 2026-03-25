import db from "./index.js";

function buildMatchHash(watchId, alertType) {
  return `${watchId}:${alertType}:${Date.now()}`;
}

export function getLastAlertForWatch(watchId, alertType = "tickets_available") {
  return (
    db
      .prepare(`
        SELECT *
        FROM alerts
        WHERE watch_id = ?
          AND alert_type = ?
        ORDER BY sent_at DESC, id DESC
        LIMIT 1
      `)
      .get(watchId, alertType) || null
  );
}

export function insertAlert(
  watchId,
  alertType = "tickets_available",
  message = null
) {
  const matchHash = buildMatchHash(watchId, alertType);

  const watch = db
    .prepare(`
      SELECT *
      FROM watches
      WHERE id = ?
      LIMIT 1
    `)
    .get(watchId);

  const email = process.env.ALERT_TO_EMAIL ?? "";

  return db
    .prepare(`
      INSERT INTO alerts (watch_id, alert_type, message, match_hash, email)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(watchId, alertType, message, matchHash, email);
}