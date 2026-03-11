const API_BASE = "https://i9.up.railway.app/api";

export async function loadRooms() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/rooms/list`, {
    headers: { Authorization: token }
  });

  return await res.json();
}

export async function createRoom(name) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/rooms/create`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  });

  return await res.json();
}

export async function sendRoomMessage(room_id, content) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/rooms/send`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ room_id, content })
  });

  return await res.json();
}
