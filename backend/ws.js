import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function setupWebSocket(server) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws, req) => {
        const token = req.url?.split("token=")[1];

        if (!token) {
            ws.close();
            return;
        }

        let user;
        try {
            user = jwt.verify(token, JWT_SECRET);
        } catch {
            ws.close();
            return;
        }

        ws.user = user;

        ws.on("message", async (msg) => {
            try {
                const data = JSON.parse(msg);

                if (data.type === "room_message") {
                    const id = crypto.randomUUID();

                    await pool.query(
                        "INSERT INTO room_messages (id, room_id, user_id, content) VALUES ($1, $2, $3, $4)",
                        [id, data.roomId, user.id, data.content]
                    );

                    // Broadcast to all clients
                    wss.clients.forEach((client) => {
                        if (client.readyState === 1) {
                            client.send(JSON.stringify({
                                type: "room_message",
                                roomId: data.roomId,
                                username: user.username,
                                content: data.content
                            }));
                        }
                    });
                }
            } catch (err) {
                console.error("WS error:", err);
            }
        });
    });

    console.log("WebSocket server ready");
}
