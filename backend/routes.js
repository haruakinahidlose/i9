import express from "express";
import jwt from "jsonwebtoken";
import db from "./backend/db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

/* ---------- helpers ---------- */

function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token" });
    }
    const token = auth.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}

/* ---------- auth ---------- */

// register / login (username only, creates if not exists)
router.post("/auth/login", async (req, res) => {
    const { username, pfp_url } = req.body;
    if (!username) return res.status(400).json({ error: "username required" });

    try {
        let result = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        let user;
        if (result.rows.length === 0) {
            result = await db.query(
                "INSERT INTO users (username, pfp_url) VALUES ($1, $2) RETURNING *",
                [username, pfp_url || null]
            );
        }
        user = result.rows[0];

        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ user, token });
    } catch (err) {
        console.error("login error:", err);
        res.status(500).json({ error: "server error" });
    }
});

/* ---------- profile ---------- */

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, username, pfp_url, created_at FROM users WHERE id = $1",
            [req.user.id]
        );
        res.json(result.rows[0]);
    } catch {
        res.status(500).json({ error: "server error" });
    }
});

router.post("/me/pfp", authMiddleware, async (req, res) => {
    const { pfp_url } = req.body;
    try {
        const result = await db.query(
            "UPDATE users SET pfp_url = $1 WHERE id = $2 RETURNING id, username, pfp_url",
            [pfp_url || null, req.user.id]
        );
        res.json(result.rows[0]);
    } catch {
        res.status(500).json({ error: "server error" });
    }
});

/* ---------- rooms ---------- */

router.get("/rooms", authMiddleware, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT r.*
             FROM rooms r
             JOIN room_members m ON m.room_id = r.id
             WHERE m.user_id = $1
             ORDER BY r.id`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch {
        res.status(500).json({ error: "server error" });
    }
});

router.post("/rooms", authMiddleware, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });

    try {
        const roomRes = await db.query(
            "INSERT INTO rooms (name, is_dm) VALUES ($1, FALSE) RETURNING *",
            [name]
        );
        const room = roomRes.rows[0];

        await db.query(
            "INSERT INTO room_members (room_id, user_id) VALUES ($1, $2)",
            [room.id, req.user.id]
        );

        res.json(room);
    } catch (err) {
        console.error("create room error:", err);
        res.status(500).json({ error: "server error" });
    }
});

router.get("/rooms/:id/messages", authMiddleware, async (req, res) => {
    const roomId = req.params.id;
    try {
        const result = await db.query(
            `SELECT m.*, u.username, u.pfp_url
             FROM messages m
             LEFT JOIN users u ON u.id = m.user_id
             WHERE m.room_id = $1
             ORDER BY m.created_at ASC`,
            [roomId]
        );
        res.json(result.rows);
    } catch {
        res.status(500).json({ error: "server error" });
    }
});

router.post("/rooms/:id/messages", authMiddleware, async (req, res) => {
    const roomId = req.params.id;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });

    try {
        const result = await db.query(
            `INSERT INTO messages (room_id, user_id, content)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [roomId, req.user.id, content]
        );
        res.json(result.rows[0]);
    } catch {
        res.status(500).json({ error: "server error" });
    }
});

/* ---------- DMs ---------- */

router.get("/dms/:userId", authMiddleware, async (req, res) => {
    const otherId = req.params.userId;
    try {
        const result = await db.query(
            `SELECT d.*, su.username AS sender_name, ru.username AS receiver_name
             FROM dms d
             JOIN users su ON su.id = d.sender_id
             JOIN users ru ON ru.id = d.receiver_id
             WHERE (sender_id = $1 AND receiver_id = $2)
                OR (sender_id = $2 AND receiver_id = $1)
             ORDER BY d.created_at ASC`,
            [req.user.id, otherId]
        );
        res.json(result.rows);
    } catch {
        res.status(500).json({ error: "server error" });
    }
});

router.post("/dms/:userId", authMiddleware, async (req, res) => {
    const otherId = req.params.userId;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });

    try {
        const result = await db.query(
            `INSERT INTO dms (sender_id, receiver_id, content)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [req.user.id, otherId, content]
        );
        res.json(result.rows[0]);
    } catch {
        res.status(500).json({ error: "server error" });
    }
});

/* ---------- friends ---------- */

router.get("/friends", authMiddleware, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.username, u.pfp_url
             FROM friends f
             JOIN users u ON u.id = f.friend_id
             WHERE f.user_id = $1
             ORDER BY u.username`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch {
        res.status(500).json({ error: "server error" });
    }
});

router.get("/friends/requests", authMiddleware, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT fr.*, u.username AS from_username
             FROM friend_requests fr
             JOIN users u ON u.id = fr.from_user_id
             WHERE fr.to_user_id = $1 AND fr.status = 'pending'
             ORDER BY fr.created_at`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch {
        res.status(500).json({ error: "server error" });
    }
});

router.post("/friends/requests/:userId", authMiddleware, async (req, res) => {
    const toId = req.params.userId;
    if (parseInt(toId) === req.user.id) {
        return res.status(400).json({ error: "cannot friend yourself" });
    }

    try {
        const result = await db.query(
            `INSERT INTO friend_requests (from_user_id, to_user_id)
             VALUES ($1, $2)
             ON CONFLICT (from_user_id, to_user_id) DO NOTHING
             RETURNING *`,
            [req.user.id, toId]
        );
        res.json(result.rows[0] || { status: "exists_or_sent" });
    } catch {
        res.status(500).json({ error: "server error" });
    }
});

router.post("/friends/requests/:id/accept", authMiddleware, async (req, res) => {
    const reqId = req.params.id;
    try {
        const frRes = await db.query(
            "SELECT * FROM friend_requests WHERE id = $1 AND to_user_id = $2",
            [reqId, req.user.id]
        );
        if (frRes.rows.length === 0) {
            return res.status(404).json({ error: "request not found" });
        }
        const fr = frRes.rows[0];

        await db.query(
            "UPDATE friend_requests SET status = 'accepted' WHERE id = $1",
            [reqId]
        );

        await db.query(
            `INSERT INTO friends (user_id, friend_id)
             VALUES ($1, $2), ($2, $1)
             ON CONFLICT (user_id, friend_id) DO NOTHING`,
            [fr.from_user_id, fr.to_user_id]
        );

        res.json({ status: "accepted" });
    } catch {
        res.status(500).json({ error: "server error" });
    }
});

router.post("/friends/requests/:id/reject", authMiddleware, async (req, res) => {
    const reqId = req.params.id;
    try {
        await db.query(
            "UPDATE friend_requests SET status = 'rejected' WHERE id = $1 AND to_user_id = $2",
            [reqId, req.user.id]
        );
        res.json({ status: "rejected" });
    } catch {
        res.status(500).json({ error: "server error" });
    }
});

export default router;
