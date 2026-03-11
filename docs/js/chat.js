import { state, requireAuth, setCurrentUserLabel, setUserPfp } from "/i9/js/ui.js";
import { connectWS, onWSMessage, sendWSMessage } from "/i9/js/ws.js";
import { loadFriends, loadFriendRequests, setupFriendActions } from "/i9/js/friends.js";
import { loadRooms, setupRoomActions } from "/i9/js/rooms.js";
import { loadDMList } from "/i9/js/dms.js";

export const API_BASE = "https://i9.up.railway.app/api/";

const messagesEl = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const msgInput = document.getElementById("messageInput");
const logoutBtn = document.getElementById("logoutBtn");
const changePfpBtn = document.getElementById("changePfpBtn");

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

if (logoutBtn) {
  logoutBtn.onclick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/i9/index.html";
  };
}

if (changePfpBtn) {
  changePfpBtn.onclick = async () => {
    const url = prompt("Enter image URL:");
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

if (sendBtn && msgInput) {
  sendBtn.onclick = sendMessage;
  msgInput.onkeydown = e => {
    if (e.key === "Enter") sendMessage();
  };
}

async function initProfile() {
  const res = await fetch(`${API_BASE}profile/${state.currentUser}`);
  const data = await res.json();
  if (data && data.pfp) setUserPfp(data.pfp);
}

/* -----------------------------
   DISCORD-STYLE MESSAGE GROUPING
------------------------------ */

let lastSender = null;
let lastMinute = null;

function appendMessage(m) {
  const div = document.createElement("div");
  div.className = "message";

  const msgTime = new Date(m.timestamp || Date.now());
  const minute = msgTime.getHours() + ":" + msgTime.getMinutes();

  const isGrouped =
    m.sender === lastSender &&
    minute === lastMinute;

  if (!isGrouped) {
    const header = document.createElement("div");
    header.className = "message-header";

    const pfp = document.createElement("img");
    pfp.className = "pfp";
    pfp.src = m.pfp || "https://i.imgur.com/0y8Ftya.png";

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = `${m.sender} • ${msgTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })}`;

    header.appendChild(pfp);
    header.appendChild(meta);
    div.appendChild(header);
  }

  const content = document.createElement("div");
  content.className = isGrouped ? "message-text grouped" : "message-text";
  content.textContent = m.content;

  div.appendChild(content);

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  lastSender = m.sender;
  lastMinute = minute;
}

/* ----------------------------- */

export async function loadMessagesForRoom(roomId) {
  const res = await fetch(`${API_BASE}messages/room/${roomId}`, {
    headers: { Authorization: state.token }
  });
  renderMessages(await res.json());
}

export async function loadMessagesForDM(dmId) {
  const res = await fetch(`${API_BASE}messages/dm/${dmId}`, {
    headers: { Authorization: state.token }
  });
  renderMessages(await res.json());
}

function renderMessages(list) {
  messagesEl.innerHTML = "";
  list.forEach(m => appendMessage(m));
}

function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;
  if (!state.currentRoom && !state.currentDM) return;

  sendWSMessage({
    type: state.currentRoom ? "room" : "dm",
    roomId: state.currentRoom,
    dmId: state.currentDM,
    sender: state.currentUser,
    content: text
  });

  msgInput.value = "";
}

onWSMessage(msg => {
  if (msg.type === "status") return;

  if (msg.type === "room" && msg.roomId === state.currentRoom) appendMessage(msg);
  if (msg.type === "dm" && msg.dmId === state.currentDM) appendMessage(msg);
});
