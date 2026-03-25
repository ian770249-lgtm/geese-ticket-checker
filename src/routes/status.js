import { Router } from "express";
import db from "../db/index.js";
import {
  getAllWatches,
  createWatch,
  updateWatchStatus,
} from "../db/watches.js";
import { insertCheckResult } from "../db/check-results.js";
import { runCheck } from "../services/checker.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(getAllWatches());
});

router.post("/", (req, res) => {
  try {
    const { name, url, max_price, quantity } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: "Missing name or url" });
    }

    const watch = createWatch({
      name,
      url,
      maxPrice: max_price,
      quantity,
    });

    res.json({ ok: true, watch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/run", async (req, res) => {
  try {
    const watchId = Number(req.params.id);

    const watch = db.prepare(`SELECT * FROM watches WHERE id = ?`).get(watchId);
    if (!watch) return res.status(404).json({ error: "Not found" });

    const result = await runCheck(watch.url);
    const status = result.available ? "in_stock" : "out_of_stock";

    insertCheckResult({
      watchId,
      status,
      message: "manual",
      matchedCount: result.count ?? 0,
      cheapestPrice: result.price ?? null,
    });

    updateWatchStatus(watchId, status);

    res.json({ ok: true, result, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/toggle", (req, res) => {
  const id = Number(req.params.id);

  const watch = db.prepare(`SELECT * FROM watches WHERE id = ?`).get(id);
  if (!watch) return res.status(404).json({ error: "Not found" });

  db.prepare(`UPDATE watches SET enabled = ? WHERE id = ?`)
    .run(watch.enabled ? 0 : 1, id);

  res.json({ ok: true });
});

/* 🔴 DELETE WATCH */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  db.prepare(`DELETE FROM watches WHERE id = ?`).run(id);

  res.json({ ok: true });
});

/* 🟡 UPDATE WATCH */
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, max_price, quantity } = req.body;

  db.prepare(`
    UPDATE watches
    SET name = ?, max_price = ?, quantity = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, max_price ?? null, quantity ?? 1, id);

  const updated = db.prepare(`SELECT * FROM watches WHERE id = ?`).get(id);

  res.json({ ok: true, watch: updated });
});

export default router;