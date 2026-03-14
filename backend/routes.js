import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "./db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

/* -----------------------------------------------------------
   AUTH
----------------------------------------------------------- */

router.post("/auth/signup", async (req, res) => {
  const { username, password, pfp_url } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  try {
    const exists = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (exists.rows.length > 0)
      return res.status(400).json({ error: "username already taken" });

    const hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (username, password_hash, pfp_url)
       VALUES ($1, $2, $3)
       RETURNING id, username, pfp_url`,
      [username, hash, pfp_url || null]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user, token });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ error: "server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: "user not found" });

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ error: "incorrect password" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        pfp_url: user.pfp_url
      },
      token
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "server error" });
  }
});

/* -----------------------------------------------------------
   AUTH MIDDLEWARE
----------------------------------------------------------- */

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

/* -----------------------------------------------------------
   USER SEARCH (needed for friends + DMs)
----------------------------------------------------------- */

router.get("/users/search", auth, async (req, res) => {
  const username = req.query.username;

  if (!username)
    return res.status(400).json({ error: "username required" });

  const result = await db.query(
    "SELECT id, username, pfp_url FROM users WHERE username = $1",
    [username]
  );

  if (result.rows.length === 0)
    return res.status(404).json({ error: "user not found" });

  res.json(result.rows[0]);
});

/* -----------------------------------------------------------
   PROFILE
----------------------------------------------------------- */

router.get("/me", auth, async (req, res) => {
  const result = await db.query(
    "SELECT id, username, pfp_url FROM users WHERE id = $1",
    [req.user.id]
  );
  res.json(result.rows[0]);
});

router.post("/me/pfp", auth, async (req, res) => {
  const { pfp_url } = req.body;
  const result = await db.query(
    "UPDATE users SET pfp_url = $1 WHERE id = $2 RETURNING id, username, pfp_url",
    [pfp_url, req.user.id]
  );
  res.json(result.rows[0]);
});

/* -----------------------------------------------------------
   ROOMS (GROUPS)
----------------------------------------------------------- */

router.get("/rooms", auth, async (req, res) => {
  const result = await db.query(
    `SELECT r.*
     FROM rooms r
     JOIN room_members m ON m.room_id = r.id
     WHERE m.user_id = $1
     ORDER BY r.id`,
    [req.user.id]
  );
  res.json(result.rows);
});

router.post("/rooms", auth, async (req, res) => {
  const { name } = req.body;
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
});

/* -----------------------------------------------------------
   ROOM MESSAGES
----------------------------------------------------------- */

router.get("/rooms/:id/messages", auth, async (req, res) => {
  const result = await db.query(
    `SELECT m.*, u.username, u.pfp_url
     FROM messages m
     LEFT JOIN users u ON u.id = m.user_id
     WHERE m.room_id = $1
     ORDER BY m.created_at ASC`,
    [req.params.id]
  );
  res.json(result.rows);
});

router.post("/rooms/:id/messages", auth, async (req, res) => {
  const { content } = req.body;
  const result = await db.query(
    `INSERT INTO messages (room_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [req.params.id, req.user.id, content]
  );
  res.json(result.rows[0]);
});

/* -----------------------------------------------------------
   DIRECT MESSAGES
----------------------------------------------------------- */

router.get("/dms/:userId", auth, async (req, res) => {
  const other = req.params.userId;
  const result = await db.query(
    `SELECT d.*, su.username AS sender_name, ru.username AS receiver_name
     FROM dms d
     JOIN users su ON su.id = d.sender_id
     JOIN users ru ON ru.id = d.receiver_id
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)
     ORDER BY d.created_at ASC`,
    [req.user.id, other]
  );
  res.json(result.rows);
});

router.post("/dms/:userId", auth, async (req, res) => {
  const other = req.params.userId;
  const { content } = req.body;

  const result = await db.query(
    `INSERT INTO dms (sender_id, receiver_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [req.user.id, other, content]
  );
  res.json(result.rows[0]);
});

/* -----------------------------------------------------------
   FRIENDS
----------------------------------------------------------- */

router.get("/friends", auth, async (req, res) => {
  const result = await db.query(
    `SELECT u.id, u.username, u.pfp_url
     FROM friends f
     JOIN users u ON u.id = f.friend_id
     WHERE f.user_id = $1`,
    [req.user.id]
  );
  res.json(result.rows);
});

router.get("/friends/requests", auth, async (req, res) => {
  const result = await db.query(
    `SELECT fr.*, u.username AS from_username
     FROM friend_requests fr
     JOIN users u ON u.id = fr.from_user_id
     WHERE fr.to_user_id = $1 AND fr.status = 'pending'`,
    [req.user.id]
  );
  res.json(result.rows);
});

router.post("/friends/requests/:userId", auth, async (req, res) => {
  const to = req.params.userId;

  const result = await db.query(
    `INSERT INTO friend_requests (from_user_id, to_user_id)
     VALUES ($1, $2)
     ON CONFLICT (from_user_id, to_user_id) DO NOTHING
     RETURNING *`,
    [req.user.id, to]
  );

  res.json(result.rows[0] || { status: "exists_or_sent" });
});

router.post("/friends/requests/:id/accept", auth, async (req, res) => {
  const id = req.params.id;

  const frRes = await db.query(
    "SELECT * FROM friend_requests WHERE id = $1 AND to_user_id = $2",
    [id, req.user.id]
  );

  if (frRes.rows.length === 0)
    return res.status(404).json({ error: "not found" });

  const fr = frRes.rows[0];

  await db.query(
    "UPDATE friend_requests SET status = 'accepted' WHERE id = $1",
    [id]
  );

  await db.query(
    `INSERT INTO friends (user_id, friend_id)
     VALUES ($1, $2), ($2, $1)
     ON CONFLICT DO NOTHING`,
    [fr.from_user_id, fr.to_user_id]
  );

  res.json({ status: "accepted" });
});

router.post("/friends/requests/:id/reject", auth, async (req, res) => {
  await db.query(
    "UPDATE friend_requests SET status = 'rejected' WHERE id = $1 AND to_user_id = $2",
    [req.params.id, req.user.id]
  );
  res.json({ status: "rejected" });
});

export default router;
