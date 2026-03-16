async function loadFriends() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://i9.up.railway.app/api/friends/list", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const box = document.getElementById("friendsList");
  box.innerHTML = "";

  data.friends.forEach(f => {
    const div = document.createElement("div");
    div.textContent = f.username;
    box.appendChild(div);
  });
}

async function loadPending() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://i9.up.railway.app/api/friends/pending", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const box = document.getElementById("pendingList");
  box.innerHTML = "";

  data.pending.forEach(req => {
    const div = document.createElement("div");
    div.className = "pending-item";

    // Safari fix: wrap username in a span
    const nameSpan = document.createElement("span");
    nameSpan.textContent = req.from_username;
    div.appendChild(nameSpan);

    const accept = document.createElement("button");
    accept.textContent = "✓";
    accept.onclick = () => respond(req.id, "accept");

    const reject = document.createElement("button");
    reject.textContent = "X";
    reject.onclick = () => respond(req.id, "reject");

    // Debug: confirm buttons exist
    console.log("Buttons created:", accept, reject);

    div.appendChild(accept);
    div.appendChild(reject);
    box.appendChild(div);
  });
}

async function respond(id, action) {
  const token = localStorage.getItem("token");

  await fetch(`https://i9.up.railway.app/api/friends/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ id })
  });

  loadPending();
  loadFriends();
}

document.getElementById("addFriendBtn").onclick = async () => {
  const token = localStorage.getItem("token");
  const username = document.getElementById("addFriendInput").value.trim();
  if (!username) return;

  await fetch("https://i9.up.railway.app/api/friends/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ username })
  });

  document.getElementById("addFriendInput").value = "";
  loadPending();
};
