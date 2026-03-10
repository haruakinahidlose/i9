import db from "./db.js";

export default function setupWS(wss) {
  wss.on("connection", ws => {
    ws.on("message", async data => {
      const msg = JSON.parse(data);

      // presence updates
      if (msg.type === "status") {
        await db.run(
          "UPDATE users SET status=? WHERE username=?",
          [msg.status, msg.user]
        );

        wss.clients.forEach(c => {
          if (c.readyState === 1) c.send(JSON.stringify(msg));
        });
        return;
      }

      // chat messages
      if (msg.type === "room" || msg.type === "dm") {
        msg.timestamp = Date.now();

        const user = await db.get(
          "SELECT id FROM users WHERE username=?",
          [msg.sender]
        );

        if (user) {
          if (msg.type === "room") {
            await db.run(
              "INSERT INTO messages (roomId, dmId, sender, content, timestamp) VALUES (?, NULL, ?, ?, ?)",
              [msg.roomId, user.id, msg.content, msg.timestamp]
            );
          } else {
            await db.run(
              "INSERT INTO messages (roomId, dmId, sender, content, timestamp) VALUES (NULL, ?, ?, ?, ?)",
              [msg.dmId, user.id, msg.content, msg.timestamp]
            );
          }
        }

        wss.clients.forEach(c => {
          if (c.readyState === 1) c.send(JSON.stringify(msg));
        });
      }
    });
  });
}
