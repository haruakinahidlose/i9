import { state } from "/i9/js/ui.js";

let ws;

export function connectWS() {
  ws = new WebSocket("wss://i9.up.railway.app");

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: "status",
      user: state.currentUser,
      status: "online"
    }));
  };

  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (onMessageCallback) onMessageCallback(msg);
  };
}

let onMessageCallback = null;

export function onWSMessage(cb) {
  onMessageCallback = cb;
}

export function sendWSMessage(obj) {
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(obj));
  }
}
