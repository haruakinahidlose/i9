export default function setupWS(wss) {
    wss.on("connection", (ws) => {
        console.log("WS client connected");

        ws.on("message", (msg) => {
            // For now, broadcast raw messages
            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(msg.toString());
                }
            });
        });

        ws.on("close", () => {
            console.log("WS client disconnected");
        });
    });
}
