// Utility: show only one panel at a time
function showPanel(id) {
  document.querySelectorAll(".panel").forEach(p => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// Sidebar toggle
document.getElementById("toggleSidebar").onclick = () => {
  document.getElementById("sidebar").classList.toggle("open");
};

// FRIENDS BUTTON
document.getElementById("friendsBtn").onclick = () => {
  showPanel("friendsPanel");
  loadPending();
  loadFriends();
};

// DMS BUTTON
document.getElementById("dmsBtn").onclick = () => {
  showPanel("dmPanel");
  loadDMs();
};

// GROUPS BUTTON
document.getElementById("groupsBtn").onclick = () => {
  showPanel("groupsPanel");
  loadRooms();
};

// Set username in sidebar
function setUsername() {
  const u = localStorage.getItem("username");
  if (u) {
    document.getElementById("usernameDisplay").textContent = u;
  }
}

// Run on page load
window.onload = () => {
  setUsername();
  showPanel("friendsPanel");
  loadPending();
  loadFriends();
};
