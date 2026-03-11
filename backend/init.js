import { pool } from "./db.js";
import fs from "fs";

const schema = fs.readFileSync("./backend/schema.sql", "utf8");

(async () => {
    try {
        await pool.query(schema);
        console.log("Database initialized");
    } catch (err) {
        console.error("Init error:", err);
    }
})();
