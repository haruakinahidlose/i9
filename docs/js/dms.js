const API_BASE = "https://i9.up.railway.app/api";

export async function loadDMs() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/dms/list`, {
    headers: { Authorization: token }
  });

  return await res.json();
}

export async function startDM(user_id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/dms/start`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user_id })
  });

  return await res.json();
}

export async function sendDM(dm_id, content) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/dms/send`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ dm_id, content })
  });

  return await res.json();
}
