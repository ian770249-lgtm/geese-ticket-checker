import { Router } from "express";
import db from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const rows = db
    .prepare(`
      SELECT
        cr.*,
        w.name
      FROM check_results cr
      JOIN watches w
        ON w.id = cr.watch_id
      ORDER BY cr.id DESC
      LIMIT 100
    `)
    .all();

  res.json(rows);
});

router.get("/:watchId", (req, res) => {
  const watchId = Number(req.params.watchId);

  const rows = db
    .prepare(`
      SELECT *
      FROM check_results
      WHERE watch_id = ?
      ORDER BY id DESC
      LIMIT 100
    `)
    .all(watchId);

  res.json(rows);
});

export default router;