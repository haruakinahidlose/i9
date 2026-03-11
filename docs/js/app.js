window.onload = () => {
  const token = localStorage.getItem("token");
  if (!token) location.href = "index.html";

  loadUserPanel();
  loadRooms();
  loadDMs();
  loadFriends();
  setupWS();
  setupSidebarToggle();
};
