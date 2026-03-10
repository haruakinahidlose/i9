import { state, requireAuth, setCurrentUserLabel } from "./ui.js";
import { connectWS, onWSMessage, sendWSMessage } from "./ws.js";
import { loadFriends, setupFriendActions } from "./friends.js";
import { loadRooms, setupRoomActions } from "./rooms.js";
import { loadDMList } from "./dms.js";

export const API_BASE = "https://your-railway-backend-url.up.railway.app/api";

const messagesEl = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const msgInput = document.getElementById("messageInput");
const logoutBtn = document.getElementById("logoutBtn");

requireAuth();
setCurrentUserLabel();
connectWS();

loadFriends();
loadRooms();
loadDMList();
setupFriendActions();
setupRoomActions();

if (logoutBtn) {
  logoutBtn.onclick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "index.html";
  };
}

if (sendBtn && msgInput) {
  sendBtn.onclick = sendMessage;
  msgInput.onkeydown = e => {
    if (e.key === "Enter") sendMessage();
  };
}

export async function loadMessagesForRoom(roomId) {
  const res = await fetch(`${API_BASE}/messages/room/${roomId}`, {
    headers: { Authorization: state.token }
  });
  const data = await res.json();
  renderMessages(data);
}

export async function loadMessagesForDM(dmId) {
  const res = await fetch(`${API_BASE}/messages/dm/${dmId}`, {
    headers: { Authorization: state.token }
  });
  const data = await res.json();
  renderMessages(data);
}

function renderMessages(list) {
  if (!messagesEl) return;
  messagesEl.innerHTML = "";
  list.forEach(m => {
    const div = document.createElement("div");
    div.className = "message";
    const senderSpan = document.createElement("span");
    senderSpan.className = "sender";
    senderSpan.textContent = m.sender || "User";
    const contentSpan = document.createElement("span");
    contentSpan.textContent = m.content;
    div.appendChild(senderSpan);
    div.appendChild(contentSpan);
    messagesEl.appendChild(div);
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;
  if (!state.currentRoom && !state.currentDM) return;

  const payload = {
    type: state.currentRoom ? "room" : "dm",
    roomId: state.currentRoom,
    dmId: state.currentDM,
    sender: state.currentUser,
    content: text,
    timestamp: Date.now()
  };

  sendWSMessage(payload);
  msgInput.value = "";
}

// Handle incoming WS messages
onWSMessage(msg => {
  // Only show if it matches current room/DM
  if (msg.type === "room" && msg.roomId === state.currentRoom) {
    appendMessage(msg);
  }
  if (msg.type === "dm" && msg.dmId === state.currentDM) {
    appendMessage(msg);
  }
});

function appendMessage(m) {
  if (!messagesEl) return;
  const div = document.createElement("div");
  div.className = "message";
  const senderSpan = document.createElement("span");
  senderSpan.className = "sender";
  senderSpan.textContent = m.sender || "User";
  const contentSpan = document.createElement("span");
  contentSpan.textContent = m.content;
  div.appendChild(senderSpan);
  div.appendChild(contentSpan);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
