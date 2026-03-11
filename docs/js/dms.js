async function loadDMs() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://i9.up.railway.app/api/friends/list", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const box = document.getElementById("dmList");
  box.innerHTML = "";

  data.friends.forEach(f => {
    const div = document.createElement("div");
    div.textContent = f.username;
    div.onclick = () => openDM(f.friend_id);
    box.appendChild(div);
  });
}

function openDM(id) {
  ws.send(JSON.stringify({ type: "join_dm", id }));
}
