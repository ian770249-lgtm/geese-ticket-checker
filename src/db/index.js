import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { initSchema } from "./schema.js";

const dbPath = process.env.DATABASE_PATH || "./data/app.db";
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

initSchema(db);

export default db;