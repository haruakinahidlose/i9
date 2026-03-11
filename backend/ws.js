import jwt from "jsonwebtoken";
import { pool } from "./db.js";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export default function setupWS(wss) {
    wss.on("connection", (ws) => {
        ws.user = null;
        ws.room = null;

        ws.send(JSON.stringify({ type: "system", message: "Connected to NebulaShift WS" }));

        ws.on("message", async (raw) => {
            let msg;
            try {
                msg = JSON.parse(raw);
            } catch {
                return;
            }

            //
            // AUTHENTICATE
            //
            if (msg.type === "auth") {
                try {
                    const payload = jwt.verify(msg.token, JWT_SECRET);
                    ws.user = payload;
                    ws.send(JSON.stringify({ type: "auth_ok", user: payload }));
                } catch {
                    ws.send(JSON.stringify({ type: "auth_error" }));
                }
                return;
            }

            if (!ws.user) {
                ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
                return;
            }

            //
            // JOIN ROOM
            //
            if (msg.type === "join_room") {
                ws.room = msg.roomId;
                ws.send(JSON.stringify({ type: "joined", roomId: msg.roomId }));
                return;
            }

            //
            // SEND ROOM MESSAGE
            //
            if (msg.type === "room_message") {
                if (!ws.room) return;

                const id = uuidv4();
                const { id: userId } = ws.user;

                await pool.query(
                    "INSERT INTO room_messages (id, room_id, user_id, content) VALUES ($1, $2, $3, $4)",
                    [id, ws.room, userId, msg.content]
                );

                const payload = {
                    type: "room_message",
                    id,
                    roomId: ws.room,
                    user: ws.user.username,
                    content: msg.content,
                    created_at: Date.now()
                };

                // Broadcast to all clients in the same room
                wss.clients.forEach(client => {
                    if (client.readyState === 1 && client.room === ws.room) {
                        client.send(JSON.stringify(payload));
                    }
                });
            }
        });

        ws.on("close", () => {
            console.log("WS client disconnected");
        });
    });
}
