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
            "INSERT INTO rooms (id, name) VALUES ($1, $2)",
            [id, name]
        );
        res.json({ id, name });
    } catch (err) {
        console.error("Room create error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// List rooms
router.get("/rooms/list", authRequired, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name FROM rooms ORDER BY created_at ASC"
        );
        res.json({ rooms: result.rows });
    } catch (err) {
        console.error("Room list error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Room message history
router.get("/rooms/history/:roomId", authRequired, async (req, res) => {
    const { roomId } = req.params;

    try {
        const result = await pool.query(
            `SELECT rm.id, rm.content, rm.created_at,
                    u.username, u.pfp
             FROM room_messages rm
             JOIN users u ON rm.user_id = u.id
             WHERE rm.room_id = $1
             ORDER BY rm.created_at ASC`,
            [roomId]
        );

        res.json({ messages: result.rows });
    } catch (err) {
        console.error("Room history error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//
// DIRECT MESSAGES (DMs)
//

// Open or create a DM channel
router.post("/dms/open", authRequired, async (req, res) => {
    const { targetId } = req.body;
    const userId = req.user.id;

    if (!targetId) return res.status(400).json({ error: "Missing targetId" });
    if (targetId === userId) return res.status(400).json({ error: "Cannot DM yourself" });

    try {
        const existing = await pool.query(
            `SELECT id FROM dms 
             WHERE (user1 = $1 AND user2 = $2)
                OR (user1 = $2 AND user2 = $1)`,
            [userId, targetId]
        );

        if (existing.rows.length > 0) {
            return res.json({ dmId: existing.rows[0].id });
        }

        const dmId = uuidv4();
        await pool.query(
            "INSERT INTO dms (id, user1, user2) VALUES ($1, $2, $3)",
            [dmId, userId, targetId]
        );

        res.json({ dmId });
    } catch (err) {
        console.error("DM open error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// DM message history
router.get("/dms/history/:dmId", authRequired, async (req, res) => {
    const { dmId } = req.params;
    const userId = req.user.id;

    try {
        const check = await pool.query(
            "SELECT * FROM dms WHERE id = $1 AND (user1 = $2 OR user2 = $2)",
            [dmId, userId]
        );

        if (check.rows.length === 0)
            return res.status(403).json({ error: "Not part of this DM" });

        const result = await pool.query(
            `SELECT m.id, m.content, m.created_at, m.sender,
                    u.username, u.pfp
             FROM dm_messages m
             JOIN users u ON m.sender = u.id
             WHERE m.dm_id = $1
             ORDER BY m.created_at ASC`,
            [dmId]
        );

        res.json({ messages: result.rows });
    } catch (err) {
        console.error("DM history error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//
// FRIENDS (PHASE 5)
//

// Send friend request
router.post("/friends/request", authRequired, async (req, res) => {
    const { targetId } = req.body;
    const userId = req.user.id;

    if (!targetId) return res.status(400).json({ error: "Missing targetId" });
    if (targetId === userId) return res.status(400).json({ error: "Cannot friend yourself" });

    try {
        const existing = await pool.query(
            `SELECT id FROM friends 
             WHERE (user_id = $1 AND friend_id = $2)
                OR (user_id = $2 AND friend_id = $1)`,
            [userId, targetId]
        );

        if (existing.rows.length > 0)
            return res.status(409).json({ error: "Already friends or pending" });

        const id = uuidv4();
        await pool.query(
            "INSERT INTO friends (id, user_id, friend_id, status) VALUES ($1, $2, $3, $4)",
            [id, userId, targetId, "pending"]
        );

        res.json({ id, status: "pending" });
    } catch (err) {
        console.error("Friend request error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Accept friend request
router.post("/friends/accept", authRequired, async (req, res) => {
    const { requestId } = req.body;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            "SELECT * FROM friends WHERE id = $1 AND friend_id = $2 AND status = 'pending'",
            [requestId, userId]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Request not found" });

        await pool.query(
            "UPDATE friends SET status = 'accepted' WHERE id = $1",
            [requestId]
        );

        res.json({ status: "accepted" });
    } catch (err) {
        console.error("Friend accept error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// List friends
router.get("/friends/list", authRequired, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT f.id, f.status,
                    u.id AS friend_id, u.username, u.pfp, u.status AS presence
             FROM friends f
             JOIN users u ON 
                (CASE 
                    WHEN f.user_id = $1 THEN f.friend_id 
                    ELSE f.user_id 
                 END) = u.id
             WHERE (f.user_id = $1 OR f.friend_id = $1)
               AND f.status = 'accepted'`,
            [userId]
        );

        res.json({ friends: result.rows });
    } catch (err) {
        console.error("Friend list error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
