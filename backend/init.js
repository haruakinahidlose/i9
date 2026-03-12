import db from "./backend/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, "backend/schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

async function init() {
    try {
        await db.query(schema);
        console.log("Database initialized");
    } catch (err) {
        console.error("DB init error:", err);
    }
}

init();
