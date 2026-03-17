async function loadFriends() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://i9.up.railway.app/friends", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const box = document.getElementById("friendsList");
  box.innerHTML = "";

  data.forEach(f => {
    const div = document.createElement("div");
    div.textContent = f.username;
    box.appendChild(div);
  });
}

async function loadPending() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://i9.up.railway.app/friends/requests", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const box = document.getElementById("pendingList");
  box.innerHTML = "";

  data.forEach(req => {
    const div = document.createElement("div");
    div.className = "pending-item";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = req.from_username;
    div.appendChild(nameSpan);

    const accept = document.createElement("button");
    accept.textContent = "✓";
    accept.onclick = () => respond(req.id, "accept");

    const reject = document.createElement("button");
    reject.textContent = "X";
    reject.onclick = () => respond(req.id, "reject");

    div.appendChild(accept);
    div.appendChild(reject);
    box.appendChild(div);
  });
}

async function respond(id, action) {
  const token = localStorage.getItem("token");

  await fetch(`https://i9.up.railway.app/friends/requests/${id}/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  loadPending();
  loadFriends();
}

document.getElementById("addFriendBtn").onclick = async () => {
  const token = localStorage.getItem("token");
  const username = document.getElementById("addFriendInput").value.trim();
  if (!username) return;

  // First: search user by username
  const searchRes = await fetch(
    `https://i9.up.railway.app/users/search?username=${encodeURIComponent(username)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!searchRes.ok) return alert("User not found");
  const user = await searchRes.json();

  // Then: send friend request
  await fetch(`https://i9.up.railway.app/friends/requests/${user.id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  document.getElementById("addFriendInput").value = "";
  loadPending();
};
