export default function setupWS(wss) {
  wss.on("connection", ws => {
    ws.on("message", async data => {
      const msg = JSON.parse(data);

      // Broadcast to all clients
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(msg));
        }
      });
    });
  });
}
