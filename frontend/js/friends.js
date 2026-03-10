import { state, renderList, createListItem } from "./ui.js";
import { API_BASE } from "./chat.js";

export async function loadFriends() {
  const res = await fetch(`${API_BASE}/friends/list`, {
    headers: { Authorization: state.token }
  });
  const data = await res.json();
  state.friends = data;
  renderFriends();
}

export function renderFriends() {
  renderList("friendsList", state.friends, f =>
    createListItem(f.username, {
      onClick: () => {
        // open DM from sidebar
        import("./dms.js").then(m => m.openDM(f.username));
      }
    })
  );
}

// friend requests are not fully exposed in backend yet, but we can still
// show placeholder or extend backend later.
// For now, we just support sending friend requests.

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
  };
}
