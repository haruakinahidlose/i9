import { state, renderList, createListItem } from "./ui.js";
import { API_BASE } from "./chat.js";
import { openDM } from "./dms.js";

export async function loadFriends() {
  const res = await fetch(`${API_BASE}/friends/list`, {
    headers: { Authorization: state.token }
  });
  const data = await res.json();
  state.friends = data;
  renderFriends();
}

export async function loadFriendRequests() {
  const res = await fetch(`${API_BASE}/friends/requests`, {
    headers: { Authorization: state.token }
  });
  const data = await res.json();
  state.friendRequests = data;
  renderFriendRequests();
}

export function renderFriends() {
  renderList("friendsList", state.friends, f =>
    createListItem(f.username, {
      username: f.username,
      pfp: f.pfp,
      status: f.status || "offline",
      onClick: () => openDM(f.username)
    })
  );
}

export function renderFriendRequests() {
  renderList("friendRequests", state.friendRequests, r =>
    createListItem(r.username, {
      buttons: [
        {
          label: "✓",
          onClick: () => acceptRequest(r.id)
        }
      ]
    })
  );
}

async function acceptRequest(id) {
  await fetch(`${API_BASE}/friends/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: state.token
    },
    body: JSON.stringify({ id })
  });
  await loadFriendRequests();
  await loadFriends();
}

export function setupFriendActions() {
  const addBtn = document.getElementById("addFriendBtn");
  const input = document.getElementById("addFriendInput");

  if (!addBtn || !input) return;

  addBtn.onclick = async () => {
    const to = input.value.trim();
    if (!to) return;

    await fetch(`${API_BASE}/friends/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: state.token
      },
      body: JSON.stringify({ to })
    });

    input.value = "";
    await loadFriendRequests();
  };
}
