async function loadFriends() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://i9.up.railway.app/api/friends/list", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  const box = document.getElementById("friendsList");
  box.innerHTML = "";

  data.friends.forEach(f => {
    const div = document.createElement("div");
    div.textContent = f.username;
    box.appendChild(div);
  });
}
