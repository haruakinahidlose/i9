import { state, renderList, createListItem } from "/i9/js/ui.js";
import { sendWSMessage } from "/i9/js/ws.js";
import { loadDMList } from "/i9/js/dms.js";

export const API_BASE = "https://i9.up.railway.app/api/";

export async function loadFriends() {
  const res = await fetch(`${API_BASE}friends`, {
    headers: { Authorization: state.token }
  });
  state.friends = await res.json();
  renderFriends();
}

export async function loadFriendRequests() {
  const res = await fetch(`${API_BASE}friends/requests`, {
    headers: { Authorization: state.token }
  });
  state.friendRequests = await res.json();
  renderFriendRequests();
}

export function setupFriendActions() {
  const btn = document.getElementById("addFriendBtn");
  const input = document.getElementById("addFriendInput");

  if (!btn || !input) return;

  btn.onclick = async () => {
    const username = input.value.trim();
    if (!username) return;

    await fetch(`${API_BASE}friends/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: state.token
      },
      body: JSON.stringify({ username })
    });

    input.value = "";
    loadFriendRequests();
  };
}

function renderFriends() {
  renderList("friendsList", state.friends, f =>
    createListItem(f.username, {
      username: f.username,
      pfp: f.pfp,
      status: f.status,
      onClick: () => {
        state.currentDM = f.username;
        state.currentRoom = null;
        loadDMList();
      }
    })
  );
}

function renderFriendRequests() {
  renderList("friendRequests", state.friendRequests, r =>
    createListItem(r.username, {
      username: r.username,
      buttons: [
        {
          label: "Accept",
          onClick: async () => {
            await fetch(`${API_BASE}friends/accept`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: state.token
              },
              body: JSON.stringify({ username: r.username })
            });
            loadFriends();
            loadFriendRequests();
          }
        }
      ]
    })
  );
}
