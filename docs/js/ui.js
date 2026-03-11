function loadUserPanel() {
  const user = JSON.parse(localStorage.getItem("user"));
  document.getElementById("userName").textContent = user.username;
}

function setupSidebarToggle() {
  const sidebar = document.getElementById("sidebar");
  const chat = document.getElementById("chatArea");
  const btn = document.getElementById("toggleSidebar");

  btn.onclick = () => {
    sidebar.classList.toggle("hidden");
  };
}
