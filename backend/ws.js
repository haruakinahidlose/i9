import { WebSocketServer } from "ws";

export function setupWebSocket(server) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (socket) => {
        console.log("WebSocket connected");

        socket.on("message", (msg) => {
            console.log("Received:", msg);
            socket.send("Echo: " + msg);
        });

        socket.on("close", () => {
            console.log("WebSocket disconnected");
        });
    });
}
