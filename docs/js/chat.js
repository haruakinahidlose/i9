// FIXED IMPORT PATHS — GitHub Pages SAFE
import { state, requireAuth, setCurrentUserLabel, setUserPfp } from "/js/ui.js";
import { connectWS, onWSMessage, sendWSMessage } from "/js/ws.js";
import { loadFriends, loadFriendRequests, setupFriendActions } from "/js/friends.js";
import { loadRooms, setupRoomActions } from "/js/rooms.js";
import { loadDMList } from "/js/dms.js";

// API base
export const API_BASE = "https://i9.up.railway.app/api/";

// DOM elements
const messagesEl = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const msgInput = document.getElementById("messageInput");
const logoutBtn = document.getElementById("logoutBtn");
const changePfpBtn = document.getElementById("changePfpBtn");

// Auth + UI init
requireAuth();
setCurrentUserLabel();
connectWS();

initProfile();
loadFriends();
loadFriendRequests();
loadRooms();
loadDMList();
setupFriendActions();
setupRoomActions();

// Logout
if (logoutBtn) {
  logoutBtn.onclick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "index.html";
  };
}

// Change PFP
if (changePfpBtn) {
  changePfpBtn.onclick = async () => {
    const url = prompt("Enter image URL for your profile picture:");
    if (!url) return;
    await fetch(`${API_BASE}profile/pfp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: state.token
      },
      body: JSON.stringify({ url })
    });
    setUserPfp(url);
  };
}

// Send message
if (sendBtn && msgInput) {
  sendBtn.onclick = sendMessage;
  msgInput.onkeydown = e => {
    if (e.key === "Enter") sendMessage();
  };
}

// Load profile
async function initProfile() {
  const res = await fetch(`${API_BASE}profile/${state.currentUser}`);
  const data = await res.json();
  if (data && data.pfp) {
    setUserPfp(data.pfp);
  }
}

// Presence updates
document.addEventListener("visibilitychange", () => {
  sendWSMessage({
    type: "status",
    user: state.currentUser,
    status: document.hidden ? "away" : "online"
  });
});

window.addEventListener("beforeunload", () => {
  sendWSMessage({
    type: "status",
    user: state.currentUser,
    status: "offline"
  });
});

// Load messages
export async function loadMessagesForRoom(roomId) {
  const res = await fetch(`${API_BASE}messages/room/${roomId}`, {
    headers: { Authorization: state.token }
  });
  const data = await res.json();
  renderMessages(data);
}

export async function loadMessagesForDM(dmId) {
  const res = await fetch(`${API_BASE}messages/dm/${dmId}`, {
    headers: { Authorization: state.token }
  });
  const data = await res.json();
  renderMessages(data);
}

// Render messages
function renderMessages(list) {
  if (!messagesEl) return;
  messagesEl.innerHTML = "";
  list.forEach(m => appendMessage(m));
}

// Send message payload
function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;
  if (!state.currentRoom && !state.currentDM) return;

  const payload = {
    type: state.currentRoom ? "room" : "dm",
    roomId: state.currentRoom,
    dmId: state.currentDM,
    sender: state.currentUser,
    content: text
  };

  sendWSMessage(payload);
  msgInput.value = "";
}

// WS incoming messages
onWSMessage(msg => {
  if (msg.type === "status") return;

  if (msg.type === "room" && msg.roomId === state.currentRoom) {
    appendMessage(msg);
  }
  if (msg.type === "dm" && msg.dmId === state.currentDM) {
    appendMessage(msg);
  }
});

// Append message to UI
function appendMessage(m) {
  if (!messagesEl) return;

  const div = document.createElement("div");
  div.className = "message";

  const pfp = document.createElement("img");
  pfp.className = "pfp";
  pfp.src = m.pfp || "https://i.imgur.com/0y8Ftya.png";

  const block = document.createElement("div");
  block.className = "content-block";

  const meta = document.createElement("div");
  meta.className = "meta";
  const time = new Date(m.timestamp || Date.now()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
  meta.textContent = `${m.sender || "User"} • ${time}`;

  const content = document.createElement("div");
  content.textContent = m.content;

  block.appendChild(meta);
  block.appendChild(content);

  div.appendChild(pfp);
  div.appendChild(block);

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
