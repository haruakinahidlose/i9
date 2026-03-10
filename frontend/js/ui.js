export const state = {
  currentUser: localStorage.getItem("username") || "",
  token: localStorage.getItem("token") || "",
  currentRoom: null,
  currentDM: null,
  rooms: [],
  dms: [],
  friends: [],
  friendRequests: []
};

export function requireAuth() {
  if (!state.token) {
    window.location.href = "index.html";
  }
}

export function setCurrentUserLabel() {
  const el = document.getElementById("currentUser");
  if (el) el.textContent = state.currentUser || "Unknown";
}

export function setChatTitle(text) {
  const el = document.getElementById("chatTitle");
  if (el) el.textContent = text;
}

export function renderList(containerId, items, renderItem) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  items.forEach(item => {
    const el = renderItem(item);
    container.appendChild(el);
  });
}

export function createListItem(label, options = {}) {
  const div = document.createElement("div");
  div.className = "list-item";
  div.textContent = label;
  if (options.onClick) {
    div.onclick = options.onClick;
  }
  if (options.buttons) {
    div.textContent = "";
    const span = document.createElement("span");
    span.textContent = label;
    div.appendChild(span);
    options.buttons.forEach(btnDef => {
      const b = document.createElement("button");
      b.textContent = btnDef.label;
      b.onclick = e => {
        e.stopPropagation();
        btnDef.onClick();
      };
      div.appendChild(b);
    });
  }
  return div;
}
