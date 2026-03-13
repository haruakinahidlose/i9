import { WebSocketServer } from "ws";

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("message", (msg) => {
      // Simple broadcast
      for (const client of wss.clients) {
        if (client.readyState === 1) {
          client.send(msg.toString());
        }
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });
}
