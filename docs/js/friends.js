const API_BASE = "https://i9.up.railway.app/api";

export async function loadFriends() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/friends/list`, {
    headers: { Authorization: token }
  });

  return await res.json();
}

export async function addFriend(username) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/friends/add`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username })
  });

  return await res.json();
}

export async function acceptFriend(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/friends/accept`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id })
  });

  return await res.json();
}

export async function declineFriend(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/friends/decline`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id })
  });

  return await res.json();
}
