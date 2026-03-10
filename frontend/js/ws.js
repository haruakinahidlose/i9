export const WS_URL = "wss://your-railway-backend-url.up.railway.app";

let socket = null;
let wsHandlers = [];

export function connectWS() {
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("WS connected");
  };

  socket.onmessage = event => {
    const msg = JSON.parse(event.data);
    wsHandlers.forEach(fn => fn(msg));
  };

  socket.onclose = () => {
    console.log("WS closed");
    setTimeout(connectWS, 2000);
  };
}

export function onWSMessage(handler) {
  wsHandlers.push(handler);
}

export function sendWSMessage(payload) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}
