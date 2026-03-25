import db from "./index.js";

export function ensureSeedWatch() {
  const existing = db.prepare(`SELECT id FROM watches LIMIT 1`).get();

  if (existing) return;

  db.prepare(`
    INSERT INTO watches (
      name,
      url,
      section_filter,
      max_price,
      quantity,
      enabled,
      alert_cooldown_minutes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    "Geese London",
    "https://www.ticketmaster.co.uk/geese-london-25-03-2026/event/36006357D9F3A3D9",
    "",
    150,
    2,
    1,
    60
  );

  console.log("Seed watch created");
}