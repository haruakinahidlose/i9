// ===============================
// FRIENDS LIST
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
// TEMP DEBUG VERSION OF loadPending()
// ===============================
async function loadPending() {
  const box = document.getElementById("pendingList");
  box.innerHTML = "";

  // ⭐ FORCE a fake pending request to test UI
  const div = document.createElement("div");
  div.className = "pending-item";

  const nameSpan = document.createElement("span");
  nameSpan.textContent = "TEST_USER";
  div.appendChild(nameSpan);

  const accept = document.createElement("button");
  accept.textContent = "✓";
  div.appendChild(accept);

  const reject = document.createElement("button");
  reject.textContent = "X";
  div.appendChild(reject);

  box.appendChild(div);
}

// ===============================
// RESPOND (unused during debug)
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
// ADD FRIEND
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
