document.getElementById("createRoomBtn").onclick = async () => {
  const token = localStorage.getItem("token");
  const name = document.getElementById("roomNameInput").value.trim();
  if (!name) return;

  await fetch("https://i9.up.railway.app/api/rooms/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });

  // ⭐ Refresh the sidebar
  await loadRooms();

  // ⭐ Optional: clear input + close modal
  document.getElementById("roomNameInput").value = "";
  document.getElementById("createRoomModal").style.display = "none";
};
