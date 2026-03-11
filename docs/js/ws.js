const WS_URL = "wss://i9.up.railway.app";

export function connectWS(onMessage) {
  const token = localStorage.getItem("token");
  const socket = new WebSocket(`${WS_URL}?token=${token}`);

  socket.onopen = () => console.log("WS connected");
  socket.onmessage = (msg) => onMessage(JSON.parse(msg.data));
  socket.onclose = () => console.log("WS disconnected");

  return socket;
}
