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
