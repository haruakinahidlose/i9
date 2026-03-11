const API_BASE = "https://i9.up.railway.app/api";
const WS_URL = "wss://i9.up.railway.app";

const token = localStorage.getItem("token");
const username = localStorage.getItem("username");

if (!token || !username) {
  window.location.href = "index.html";
}

document.getElementById("currentUser").textContent = username;

const roomsList = document.getElementById("roomsList");
const friendsList = document.getElementById("friendsList");
const dmsList = document.getElementById("dmsList");
const messagesEl = document.getElementById("messages");
const chatTitle = document.getElementById("chatTitle");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let currentRoomId = null;
let currentDmId = null;
let ws;

// logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "index.html";
};

// WebSocket
function connectWS() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "status", user: username, status: "online" }));
  };

  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);

    if (msg.type === "status") {
      // could refresh friends list later
      return;
    }

    if (msg.type === "room" && msg.roomId == currentRoomId) {
      appendMessage(msg.sender, msg.content, msg.timestamp, msg.sender === username);
    }

    if (msg.type === "dm" && msg.dmId == currentDmId) {
      appendMessage(msg.sender, msg.content, msg.timestamp, msg.sender === username);
    }
  };

  ws.onclose = () => {
    setTimeout(connectWS, 2000);
  };
}

connectWS();

// helpers
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": token
  };
}

function appendMessage(sender, content, timestamp, isSelf) {
  const div = document.createElement("div");
  div.className = "message" + (isSelf ? " self" : "");
  const time = new Date(timestamp).toLocaleTimeString();
  div.innerHTML = `<span class="sender">${sender}</span><span class="time">${time}</span><div class="content">${content}</div>`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function clearMessages() {
  messagesEl.innerHTML = "";
}

// load rooms
async function loadRooms() {
  const res = await fetch(`${API_BASE}/rooms`, {
    headers: authHeaders()
  });
  const rooms = await res.json();
  roomsList.innerHTML = "";
  rooms.forEach(r => {
    const li = document.createElement("li");
    li.textContent = r.name;
    li.onclick = () => openRoom(r.id, r.name);
    roomsList.appendChild(li);
  });
}

// load friends (accepted)
async function loadFriends() {
  const res = await fetch(`${API_BASE}/friends/list`, {
    headers: authHeaders()
  });
  const friends = await res.json();
  friendsList.innerHTML = "";
  friends.forEach(f => {
    const li = document.createElement("li");
    li.textContent = `${f.username} (${f.status})`;
    li.onclick = () => openDmWith(f.username);
    friendsList.appendChild(li);
  });
}

// load DMs list (simple: from messages table)
async function loadDms() {
  // optional: you can build a dedicated endpoint later
  dmsList.innerHTML = "";
}

// open room
async function openRoom(id, name) {
  currentRoomId = id;
  currentDmId = null;
  chatTitle.textContent = `# ${name}`;
  clearMessages();

  const res = await fetch(`${API_BASE}/messages/room/${id}`, {
    headers: authHeaders()
  });
  const msgs = await res.json();
  msgs.forEach(m => {
    appendMessage(m.sender, m.content, m.timestamp, m.sender === username);
  });
}

// open DM
async function openDmWith(otherUser) {
  currentRoomId = null;
  currentDmId = null;
  chatTitle.textContent = `@ ${otherUser}`;
  clearMessages();

  const res = await fetch(`${API_BASE}/dms/open`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ user: otherUser })
  });
  const dm = await res.json();
  currentDmId = dm.id;

  const msgsRes = await fetch(`${API_BASE}/messages/dm/${dm.id}`, {
    headers: authHeaders()
  });
  const msgs = await msgsRes.json();
  msgs.forEach(m => {
    appendMessage(m.sender, m.content, m.timestamp, m.sender === username);
  });
}

// send message
sendBtn.onclick = sendMessage;
messageInput.onkeydown = e => {
  if (e.key === "Enter") sendMessage();
};

function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;
  if (!ws || ws.readyState !== 1) return;

  if (!currentRoomId && !currentDmId) return;

  const msg = {
    type: currentRoomId ? "room" : "dm",
    sender: username,
    content,
    roomId: currentRoomId,
    dmId: currentDmId
  };

  ws.send(JSON.stringify(msg));
  messageInput.value = "";
}

// UI buttons
document.getElementById("newRoomBtn").onclick = async () => {
  const name = prompt("Room name:");
  if (!name) return;
  await fetch(`${API_BASE}/rooms/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name })
  });
  loadRooms();
};

document.getElementById("addFriendBtn").onclick = async () => {
  const to = prompt("Friend username:");
  if (!to) return;
  await fetch(`${API_BASE}/friends/request`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ to })
  });
  alert("Friend request sent.");
};

// initial load
loadRooms();
loadFriends();
loadDms();
