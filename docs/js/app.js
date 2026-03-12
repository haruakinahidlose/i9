window.onload = () => {

  const API = "https://i9.up.railway.app/api";

  // SIDEBAR TOGGLE
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

  // ADD FRIEND
  document.getElementById("addFriendBtn").onclick = async () => {
    const username = document.getElementById("addFriendInput").value.trim();
    if (!username) return;

    await fetch(API + "/friends/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ username })
    });

    loadFriends();
  };

  // CREATE GROUP
  document.getElementById("createGroupBtn").onclick = async () => {
    const name = document.getElementById("createGroupInput").value.trim();
    if (!name) return;

    await fetch(API + "/rooms/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ name })
    });

    loadGroups();
  };

  // LOAD FRIENDS
  async function loadFriends() {
    const res = await fetch(API + "/friends/list", {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });

    const data = await res.json();
    document.getElementById("pendingList").innerHTML = "";
    document.getElementById("friendsList").innerHTML = "";

    (data.pending || []).forEach(req => {
      const div = document.createElement("div");
      div.textContent = req.from;
      document.getElementById("pendingList").appendChild(div);
    });

    (data.friends || []).forEach(f => {
      const div = document.createElement("div");
      div.textContent = f.username;
      document.getElementById("friendsList").appendChild(div);
    });
  }

  // LOAD DMS
  async function loadDMs() {
    const res = await fetch(API + "/dms/list", {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });

    const data = await res.json();
    const list = document.getElementById("dmList");
    list.innerHTML = "";

    (data || []).forEach(dm => {
      const div = document.createElement("div");
      div.textContent = dm.otherUser;
      list.appendChild(div);
    });
  }

  // LOAD GROUPS
  async function loadGroups() {
    const res = await fetch(API + "/rooms/list", {
      headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    });

    const data = await res.json();
    const list = document.getElementById("groupsList");
    list.innerHTML = "";

    (data || []).forEach(room => {
      const div = document.createElement("div");
      div.textContent = room.name;
      list.appendChild(div);
    });
  }

};
