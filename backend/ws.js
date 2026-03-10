export default function setupWS(wss) {
  wss.on("connection", ws => {
    ws.on("message", async data => {
      const msg = JSON.parse(data);

      // Presence update
      if (msg.type === "status") {
        wss.clients.forEach(c => {
          if (c.readyState === 1) c.send(JSON.stringify(msg));
        });
        return;
      }

      // Chat message
      if (msg.type === "room" || msg.type === "dm") {
        msg.timestamp = Date.now(); // ensure timestamp
        wss.clients.forEach(c => {
          if (c.readyState === 1) c.send(JSON.stringify(msg));
        });
      }
    });
  });
}
