import "dotenv/config";

import app from "./app.js";

import { getEnabledWatches, updateWatchStatus } from "./db/watches.js";
import { getLastAlertForWatch, insertAlert } from "./db/alerts.js";
import { insertCheckResult } from "./db/check-results.js";

import { runCheck } from "./services/checker.js";
import { sendTicketsAvailableEmail, shouldSendAlert } from "./services/alerts.js";

async function runChecker() {
  const watches = getEnabledWatches();

  console.log("Running checks for watches:", watches.length);

  for (const watch of watches) {
    try {
      console.log("Checking:", watch.name);

      const previousStatus = watch.last_status;
      const result = await runCheck(watch.url);
      const currentStatus = result.available ? "in_stock" : "out_of_stock";

      console.log("RESULT");
      console.log("Available:", result.available);
      console.log("Ticket count:", result.count);
      console.log("Price:", result.price);
      console.log("Checked at:", new Date().toISOString());
      console.log(`[STATE] ${previousStatus ?? "unknown"} -> ${currentStatus}`);

      insertCheckResult({
        watchId: watch.id,
        status: currentStatus,
        message: null,
        matchedCount: result.count ?? 0,
        cheapestPrice: result.price ?? null,
      });

      const justBecameAvailable =
        previousStatus !== "in_stock" && currentStatus === "in_stock";

      if (justBecameAvailable) {
        const lastAlert = getLastAlertForWatch(watch.id, "tickets_available");

        const canSend = shouldSendAlert(
          lastAlert,
          watch.alert_cooldown_minutes ?? 60
        );

        if (canSend) {
          try {
            await sendTicketsAvailableEmail(watch, result);

            insertAlert(
              watch.id,
              "tickets_available",
              `Tickets available for ${watch.name}`
            );

            console.log("Email alert sent.");
          } catch (alertErr) {
            console.error("Alert send failed:", alertErr.message);
          }
        } else {
          console.log("Alert skipped due to cooldown.");
        }
      }

      updateWatchStatus(watch.id, currentStatus);
    } catch (err) {
      console.error("Error during check:", err.message);
    }
  }
}

const PORT = process.env.PORT || 3000;
const INTERVAL_MS = 30000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

runChecker();
setInterval(runChecker, INTERVAL_MS);