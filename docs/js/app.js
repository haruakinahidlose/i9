const API = "https://your-backend-url"; // ← replace with your backend

// SIDEBAR TOGGLE
document.getElementById("toggleSidebar").onclick = () => {
  document.getElementById("sidebar").classList.toggle("hidden");
};

// CLOSE ALL PANELS
function closePanels() {
  document.getElementById("friendsPanel").classList.add("hidden");
  document.getElementById("dmPanel").classList.add("hidden");
  document.getElementById("groupsPanel").classList.add("hidden");
  document.getElementById("messages").style.display = "block";
}

// SIDEBAR BUTTONS
document.getElementById("friendsBtn").onclick = () => {
  closePanels();
  document.getElementById("friendsPanel").classList.remove("hidden");
  document.getElementById("messages").style.display = "none";
  loadFriends();
};

document.getElementById("dmsBtn").onclick = () => {
  closePanels();
  document.getElementById("dmPanel").classList.remove("hidden");
  document.getElementById("messages").style.display = "none";
  loadDMs();
};

document.getElementById("groupsBtn").onclick = () => {
  closePanels();
  document.getElementById("groupsPanel").classList.remove("hidden");
  document.getElementById("messages").style.display = "none";
  loadGroups();
};

// ADD FRIEND
document.getElementById("addFriendBtn").onclick = async () => {
  const username = document.getElementById("addFriendInput").value.trim();
  if (!username) return;

  await fetch(API + "/friends/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ username })
  });

  loadFriends();
};

// CREATE GROUP
document.getElementById("createGroupBtn").onclick = async () => {
  const name = document.getElementById("createGroupInput").value.trim();
  if (!name) return;

  await fetch(API + "/rooms/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ name })
  });

  loadGroups();
};

// LOAD FRIENDS
async function loadFriends() {
  const res = await fetch(API + "/friends/list", {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  });

  const data = await res.json();

  const pending = document.getElementById("pendingList");
  const friends = document.getElementById("friendsList");

  pending.innerHTML = "";
  friends.innerHTML = "";

  data.pending.forEach(req => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${req.from}
      <button onclick="acceptFriend('${req.id}')">Accept</button>
      <button onclick="rejectFriend('${req.id}')">Reject</button>
    `;
    pending.appendChild(div);
  });

  data.friends.forEach(f => {
    const div = document.createElement("div");
    div.textContent = f.username;
    friends.appendChild(div);
  });
}

async function acceptFriend(id) {
  await fetch(API + "/friends/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ id })
  });
  loadFriends();
}

async function rejectFriend(id) {
  await fetch(API + "/friends/reject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ id })
  });
  loadFriends();
}

// LOAD DMS
async function loadDMs() {
  const res = await fetch(API + "/dms/list", {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  });

  const data = await res.json();
  const list = document.getElementById("dmList");
  list.innerHTML = "";

  data.forEach(dm => {
    const div = document.createElement("div");
    div.textContent = dm.otherUser;
    div.onclick = () => openDM(dm.id);
    list.appendChild(div);
  });
}

// LOAD GROUPS
async function loadGroups() {
  const res = await fetch(API + "/rooms/list", {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  });

  const data = await res.json();
  const list = document.getElementById("groupsList");
  list.innerHTML = "";

  data.forEach(room => {
    const div = document.createElement("div");
    div.textContent = room.name;
    div.onclick = () => openGroup(room.id);
    list.appendChild(div);
  });
}

// OPEN DM
async function openDM(id) {
  closePanels();
  loadMessages("dm", id);
}

// OPEN GROUP
async function openGroup(id) {
  closePanels();
  loadMessages("room", id);
}

// LOAD MESSAGES
async function loadMessages(type, id) {
  const res = await fetch(API + `/messages/${type}/${id}`, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  });

  const data = await res.json();
  const box = document.getElementById("messages");
  box.innerHTML = "";

  data.forEach(msg => {
    const div = document.createElement("div");
    div.textContent = `${msg.username}: ${msg.text}`;
    box.appendChild(div);
  });
}

// SEND MESSAGE
document.getElementById("sendBtn").onclick = async () => {
  const text = document.getElementById("msgInput").value.trim();
  if (!text) return;

  // You will need to store currentChatType + currentChatId
  // Add that logic once backend is confirmed
};
