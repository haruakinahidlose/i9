import db from "./db.js";

export default function setupWS(wss) {
  wss.on("connection", ws => {
    ws.on("message", async data => {
      const msg = JSON.parse(data);

      // presence updates
      if (msg.type === "status") {
        await db.run(
          "UPDATE users SET status=$1 WHERE username=$2",
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
          "SELECT id FROM users WHERE username=$1",
          [msg.sender]
        );

        if (user) {
          if (msg.type === "room") {
            await db.run(
              "INSERT INTO messages (roomId, dmId, sender, content, timestamp) VALUES ($1, NULL, $2, $3, $4)",
              [msg.roomId, user.id, msg.content, msg.timestamp]
            );
          } else {
            await db.run(
              "INSERT INTO messages (roomId, dmId, sender, content, timestamp) VALUES (NULL, $1, $2, $3, $4)",
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
