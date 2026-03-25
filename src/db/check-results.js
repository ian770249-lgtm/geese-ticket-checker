import db from "./index.js";

export function insertCheckResult({
  watchId,
  status,
  message = null,
  matchedCount = 0,
  cheapestPrice = null,
}) {
  return db
    .prepare(`
      INSERT INTO check_results (
        watch_id,
        status,
        message,
        matched_count,
        cheapest_price
      )
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(watchId, status, message, matchedCount, cheapestPrice);
}