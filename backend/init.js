import db from "./backend/db.js";
import fs from "fs";

const schema = fs.readFileSync(new URL("./backend/schema.sql", import.meta.url), "utf8");

async function init() {
    try {
        await db.query(schema);
        console.log("Database initialized");
    } catch (err) {
        console.error("DB init error:", err);
    }
}

init();
