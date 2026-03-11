async function loadRooms() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://i9.up.railway.app/api/rooms/list", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const box = document.getElementById("roomList");
  box.innerHTML = "";

  data.rooms.forEach(r => {
    const div = document.createElement("div");
    div.textContent = "#" + r.name;
    div.onclick = () => openRoom(r.id);
    box.appendChild(div);
  });
}

function openRoom(id) {
  ws.send(JSON.stringify({ type: "join_room", id }));
}
