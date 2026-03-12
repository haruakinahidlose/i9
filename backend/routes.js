import express from "express";
import db from "./backend/db.js";

const router = express.Router();

// Example route
router.get("/test", (req, res) => {
    res.json({ message: "API working" });
});

export default router;
