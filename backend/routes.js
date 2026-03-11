import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { pool } from "./db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Helper: create JWT
function createAccessToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "15m" }
    );
}

// Helper: auth middleware
function authRequired(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing token" });
    }
    const token = auth.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

// Health
router.get("/", (req, res) => {
    res.json({ status: "NebulaShift backend online" });
});

//
// AUTH
//

// Signup
router.post("/auth/signup", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Missing fields" });

    try {
        const existing = await pool.query(
            "SELECT id FROM users WHERE username = $1",
            [username]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "Username taken" });
        }

        const hash = await bcrypt.hash(password, 10);
        const id = uuidv4();

        await pool.query(
            "INSERT INTO users (id, username, password_hash, status) VALUES ($1, $2, $3, $4)",
            [id, username, hash, "offline"]
        );

        const user = { id, username };
        const accessToken = createAccessToken(user);

        res.json({ user, accessToken });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Login
router.post("/auth/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Missing fields" });

    try {
        const result = await pool.query(
            "SELECT id, username, password_hash FROM users WHERE username = $1",
            [username]
        );
        if (result.rows.length === 0)
            return res.status(401).json({ error: "Invalid credentials" });

        const user = result.rows[0];
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return res.status(401).json({ error: "Invalid credentials" });

        const accessToken = createAccessToken(user);

        res.json({
            user: { id: user.id, username: user.username },
            accessToken
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get current user
router.get("/auth/me", authRequired, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, username, pfp, status FROM users WHERE id = $1",
            [req.user.id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: "User not found" });

        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error("Me error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//
// ROOMS
//

// Create room
router.post("/rooms/create", authRequired, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Missing room name" });

    try {
        const id = uuidv4();
        await pool.query(
            "INSERT INTO rooms (id, name) VALUES ($
