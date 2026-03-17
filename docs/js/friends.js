// ===============================
// LOAD FRIENDS
// ===============================
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



// ===============================
// LOAD PENDING REQUESTS (with fallback IDs)
// ===============================
async function loadPending() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://i9.up.railway.app/friends/requests", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const box = document.getElementById("pendingList");
  box.innerHTML = "";

  data.pending.forEach(req => {

    // ⭐ FRONTEND FALLBACK: ensure request has an ID
    if (!req.id) {
      req.id =
        req.request_id ||
        req.from_id ||
        req.to_id ||
        req.user_id ||
        Math.floor(Math.random() * 999999);
    }

    const div = document.createElement("div");
    div.className = "pending-item";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = req.from_username || req.username || "Unknown";
    div.appendChild(nameSpan);

    const accept = document.createElement("button");
    accept.textContent = "✓";
    accept.onclick = () => respond(req.id, "accept");
    div.appendChild(accept);

    const reject = document.createElement("button");
    reject.textContent = "X";
    reject.onclick = () => respond(req.id, "reject");
    div.appendChild(reject);

    box.appendChild(div);
  });
}



// ===============================
// RESPOND TO REQUEST (accept / reject)
// ===============================
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



// ===============================
// ADD FRIEND BY USERNAME
// ===============================
document.getElementById("addFriendBtn").onclick = async () => {
  const token = localStorage.getItem("token");
  const username = document.getElementById("addFriendInput").value.trim();
  if (!username) return;

  // Search user
  const searchRes = await fetch(
    `https://i9.up.railway.app/users/search?username=${encodeURIComponent(username)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!searchRes.ok) {
    alert("User not found");
    return;
  }

  const user = await searchRes.json();

  // Send friend request
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
