alert("JS LOADED");

window.onload = () => {

  const API = "https://i9.up.railway.app/api";

  // SAFETY CHECKS
  if (!document.getElementById("createGroupBtn")) {
    alert("ERROR: createGroupBtn not found in HTML");
    return;
  }

  if (!document.getElementById("groupsPanel")) {
    alert("ERROR: groupsPanel not found in HTML");
    return;
  }

  // SIDEBAR TOGGLE
  document.getElementById("toggleSidebar").onclick = () => {
    document.getElementById("sidebar").classList.toggle("hidden");
  };

  // CLOSE ALL PANELS
  function closePanels() {
    document.getElementById("friendsPanel").classList.add("hidden");
    document.getElementById("dmPanel").classList.add("hidden");
    document.getElementById("groupsPanel").classList.add("hidden");
    document.getElementById("messages").style.display = "block";
  }

  // SIDEBAR BUTTONS
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

  // CREATE GROUP — DEBUG VERSION
  document.getElementById("createGroupBtn").onclick = async () => {

    alert("Create button CLICKED"); // ← if you don't see this, JS never sees the button

    const name = document.getElementById("createGroupInput").value.trim();
    if (!name) {
      alert("Enter a group name first");
      return;
    }

    alert("Sending request to backend…");

    try {
      const res = await fetch(API + "/rooms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ name })
      });

      alert("Backend responded with status: " + res.status);

      if (!res.ok) {
        alert("Backend error: " + res.status);
        return;
      }

      alert("Group created!");
      loadGroups();

    } catch (err) {
      alert("Network error — request failed");
    }
  };

  // LOAD GROUPS
  async function loadGroups() {
    try {
      const res = await fetch(API + "/rooms/list", {
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
      });

      const data = await res.json();
      const list = document.getElementById("groupsList");
      list.innerHTML = "";

      (data || []).forEach(room => {
        const div = document.createElement("div");
        div.textContent = room.name;
        div.onclick = () => openGroup(room.id);
        list.appendChild(div);
      });

    } catch (e) {
      alert("Failed to load groups");
    }
  }

  // OPEN GROUP
  async function openGroup(id) {
    closePanels();
    loadMessages("room", id);
  }

  // LOAD MESSAGES
  async function loadMessages(type, id) {
    try {
      const res = await fetch(API + `/messages/${type}/${id}`, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
      });

      const data = await res.json();
      const box = document.getElementById("messages");
      box.innerHTML = "";

      (data || []).forEach(msg => {
        const div = document.createElement("div");
        div.textContent = `${msg.username}: ${msg.text}`;
        box.appendChild(div);
      });

    } catch (e) {
      alert("Failed to load messages");
    }
  }

};
