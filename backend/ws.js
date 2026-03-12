import { WebSocketServer } from "ws";

let wss = null;

export function setupWebSocket(server) {
    wss = new WebSocketServer({ server });

    wss.on("connection", (socket) => {
        console.log("WebSocket connected");

        socket.on("message", (raw) => {
            try {
                const msg = JSON.parse(raw.toString());

                if (msg.type === "room_message") {
                    broadcast({
                        type: "room_message",
                        roomId: msg.roomId,
                        content: msg.content,
                        fromUser: msg.fromUser,
                        created_at: new Date().toISOString()
                    });
                }

                if (msg.type === "dm") {
                    broadcast({
                        type: "dm",
                        fromUser: msg.fromUser,
                        toUser: msg.dmTo,
                        content: msg.content,
                        created_at: new Date().toISOString()
                    });
                }

            } catch (e) {
                console.error("WS error:", e);
            }
        });

        socket.on("close", () => {
            console.log("WebSocket disconnected");
        });
    });
}

export function broadcast(payload) {
    if (!wss) return;
    const data = JSON.stringify(payload);
    wss.clients.forEach((client) => {
        if (client.readyState === 1) client.send(data);
    });
}
