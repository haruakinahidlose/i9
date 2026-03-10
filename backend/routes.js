import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "./db.js";

const router = express.Router();
const SECRET = "nebula_secret";

// auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.json({ error: "No token" });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.json({ error: "Invalid token" });
  }
}

/* ---------- AUTH ---------- */

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const existing = await db.get(
    "SELECT id FROM users WHERE username=?",
    [username]
  );
  if (existing) return res.json({ error: "Username taken" });

  const hashed = await bcrypt.hash(password, 10);
  await db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashed]
  );

  res.json({ success: true });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await db.get(
    "SELECT * FROM users WHERE username=?",
    [username]
  );
  if (!user) return res.json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ error: "Wrong password" });

  const token = jwt.sign({ id: user.id }, SECRET);
  res.json({ token });
});

/* ---------- PROFILE / PFP ---------- */

router.post("/profile/pfp", auth, async (req, res) => {
  const { url } = req.body;
  await db.run("UPDATE users SET pfp=? WHERE id=?", [url, req.user.id]);
  res.json({ success: true });
});

router.get("/profile/:username", async (req, res) => {
  const user = await db.get(
    "SELECT username, pfp, status FROM users WHERE username=?",
    [req.params.username]
  );
  res.json(user || {});
});

/* ---------- FRIENDS ---------- */

router.post("/friends/request", auth, async (req, res) => {
  const { to } = req.body;

  const receiver = await db.get(
    "SELECT id FROM users WHERE username=?",
    [to]
  );
  if (!receiver) return res.json({ error: "User not found" });

  await db.run(
    "INSERT INTO friends (requester, receiver, status) VALUES (?, ?, 'pending')",
    [req.user.id, receiver.id]
  );

  res.json({ success: true });
});

router.post("/friends/accept", auth, async (req, res) => {
  const { id } = req.body;

  await db.run(
    "UPDATE friends SET status='accepted' WHERE id=? AND receiver=?",
    [id, req.user.id]
  );

  res.json({ success: true });
});

router.get("/friends/list", auth, async (req, res) => {
  const rows = await db.all(
    `
    SELECT f.id, u.username, u.pfp, u.status
    FROM friends f
    JOIN users u ON 
      (u.id = f.requester AND f.receiver = ?) OR
      (u.id = f.receiver AND f.requester = ?)
    WHERE f.status='accepted'
  `,
    [req.user.id, req.user.id]
  );

  res.json(rows);
});

router.get("/friends/requests", auth, async (req, res) => {
  const rows = await db.all(
    `
    SELECT f.id, u.username
    FROM friends f
    JOIN users u ON u.id = f.requester
    WHERE f.receiver=? AND f.status='pending'
  `,
    [req.user.id]
  );

  res.json(rows);
});

/* ---------- DMS ---------- */

router.post("/dms/open", auth, async (req, res) => {
  const { user } = req.body;

  const other = await db.get(
    "SELECT id FROM users WHERE username=?",
    [user]
  );
  if (!other) return res.json({ error: "User not found" });

  let dm = await db.get(
    "SELECT * FROM dms WHERE (user1=? AND user2=?) OR (user1=? AND user2=?)",
    [req.user.id, other.id, other.id, req.user.id]
  );

  if (!dm) {
    await db.run(
      "INSERT INTO dms (user1, user2) VALUES (?, ?)",
      [req.user.id, other.id]
    );
    dm = await db.get(
      "SELECT * FROM dms WHERE user1=? AND user2=?",
      [req.user.id, other.id]
    );
  }

  res.json(dm);
});

/* ---------- ROOMS ---------- */

router.post("/rooms/create", auth, async (req, res) => {
  const { name } = req.body;

  await db.run("INSERT INTO rooms (name) VALUES (?)", [name]);

  res.json({ success: true });
});

router.get("/rooms", auth, async (req, res) => {
  const rooms = await db.all("SELECT * FROM rooms");
  res.json(rooms);
});

/* ---------- MESSAGES ---------- */

router.get("/messages/room/:id", auth, async (req, res) => {
  const msgs = await db.all(
    `
    SELECT m.id, m.content, m.timestamp, u.username as sender, u.pfp
    FROM messages m
    JOIN users u ON u.id = m.sender
    WHERE m.roomId=?
    ORDER BY m.timestamp ASC
  `,
    [req.params.id]
  );
  res.json(msgs);
});

router.get("/messages/dm/:id", auth, async (req, res) => {
  const msgs = await db.all(
    `
    SELECT m.id, m.content, m.timestamp, u.username as sender, u.pfp
    FROM messages m
    JOIN users u ON u.id = m.sender
    WHERE m.dmId=?
    ORDER BY m.timestamp ASC
  `,
    [req.params.id]
  );
  res.json(msgs);
});

export default router;
