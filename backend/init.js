import { pool } from "./db.js";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Correct path to schema.sql (no matter where it's deployed)
const schemaPath = join(__dirname, "schema.sql");

(async () => {
    try {
        const schema = fs.readFileSync(schemaPath, "utf8");
        await pool.query(schema);
        console.log("Database initialized");
    } catch (err) {
        console.error("Init error:", err);
    }
})();
