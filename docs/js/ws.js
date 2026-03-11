let ws;

function setupWS() {
  ws = new WebSocket("wss://i9.up.railway.app");

  ws.onopen = () => console.log("WS connected");
  ws.onmessage = (msg) => handleWS(JSON.parse(msg.data));
}

function handleWS(data) {
  if (data.type === "message") {
    addMessage(data);
  }
}
