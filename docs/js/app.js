window.onload = () => {

  const API = "https://i9.up.railway.app/api";

  /* ---------------- SIDEBAR ---------------- */

  document.getElementById("toggleSidebar").onclick = () => {
    document.getElementById("sidebar").classList.toggle("hidden");
  };

  function closePanels() {
    document.getElementById("friendsPanel").classList.add("hidden");
    document.getElementById("dmPanel").classList.add("hidden");
    document.getElementById("groupsPanel").classList.add("hidden");
    document.getElementById("messages").style.display = "block";
  }

  document.getElementById("friendsBtn").onclick = () => {
    closePanels();
    document.getElementById("friendsPanel").classList.remove("hidden");
    document.getElementById("messages").style.display = "none";
    loadFriends();
  };

  document.getElementById("dmsBtn").onclick = () => {
    closePanels();
    document.getElementById("dmPanel").classList.remove("hidden");
    document.getElementById("messages").style.display = "none";
    loadDMs();
  };

  document.getElementById("groupsBtn").onclick = () => {
    closePanels();
    document.getElementById("groupsPanel").classList.remove("hidden");
    document.getElementById("messages").style.display = "none";
    loadGroups();
  };

  /* ---------------- USER SEARCH HELPER ---------------- */

  async function getUserByUsername(username) {
    const res = await fetch(API + "/users/search?username=" + username, {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });
    if (!res.ok) return null;
    return await res.json();
  }

  /* ---------------- ADD FRIEND ---------------- */

  document.getElementById("addFriendBtn").onclick = async () => {
    const username = document.getElementById("addFriendInput").value.trim();
    if (!username) return;

    const user = await getUserByUsername(username);
    if (!user) {
      alert("User not found");
      return;
    }

    await fetch(API + "/friends/requests/" + user.id, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    });

    loadFriends();
  };

  /* ---------------- CREATE GROUP ---------------- */

  document.getElementById("createGroupBtn").onclick = async () => {
    const name = document.getElementById("createGroupInput").value.trim();
    if (!name) return;

    await fetch(API + "/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ name })
    });

    loadGroups();
  };

  /* ---------------- LOAD FRIENDS ---------------- */

  async function loadFriends() {
    const pendingRes = await fetch(API + "/friends/requests", {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });
    const pending = await pendingRes.json();

    const friendsRes = await fetch(API + "/friends", {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });
    const friends = await friendsRes.json();

    document.getElementById("pendingList").innerHTML = "";
    document.getElementById("friendsList").innerHTML = "";

    pending.forEach(req => {
      const div = document.createElement("div");
      div.textContent = req.from_username;
      document.getElementById("pendingList").appendChild(div);
    });

    friends.forEach(f => {
      const div = document.createElement("div");
      div.textContent = f.username;
      document.getElementById("friendsList").appendChild(div);
    });
  }

  /* ---------------- LOAD GROUPS ---------------- */

  async function loadGroups() {
    const res = await fetch(API + "/rooms", {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });

    const data = await res.json();
    const list = document.getElementById("groupsList");
    list.innerHTML = "";

    data.forEach(room => {
      const div = document.createElement("div");
      div.textContent = room.name;
      list.appendChild(div);
    });
  }

  /* ---------------- LOAD DMS ---------------- */

  async function loadDMs() {
    // DMs are based on friends list
    const friendsRes = await fetch(API + "/friends", {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });
    const friends = await friendsRes.json();

    const list = document.getElementById("dmList");
    list.innerHTML = "";

    friends.forEach(f => {
      const div = document.createElement("div");
      div.textContent = f.username;
      list.appendChild(div);
    });
  }

};
