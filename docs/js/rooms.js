async function loadRooms() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://i9.up.railway.app/api/rooms/list", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const box = document.getElementById("groupsList");
  box.innerHTML = "";

  data.rooms.forEach(r => {
    const div = document.createElement("div");
    div.textContent = "#" + r.name;
    div.onclick = () => openRoom(r.id);
    box.appendChild(div);
  });
}

document.getElementById("createGroupBtn").onclick = async () => {
  const token = localStorage.getItem("token");
  const name = document.getElementById("createGroupInput").value.trim();
  if (!name) return;

  await fetch("https://i9.up.railway.app/api/rooms/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });

  document.getElementById("createGroupInput").value = "";
  loadRooms();
};

function openRoom(id) {
  ws.send(JSON.stringify({ type: "join_room", id }));
}
