// ===============================
// FRIENDS LIST
// ===============================
async function loadFriends() {
  const box = document.getElementById("friendsList");
  box.innerHTML = "";

  const div = document.createElement("div");
  div.textContent = "Friend_A";
  box.appendChild(div);
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
// ADD FRIEND (not used in debug)
// ===============================
document.getElementById("addFriendBtn").onclick = () => {
  loadPending();
};
