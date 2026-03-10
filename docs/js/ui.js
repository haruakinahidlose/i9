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

export function setUserPfp(url) {
  const el = document.getElementById("userPfp");
  if (el && url) el.src = url;
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
  div.dataset.user = options.username || "";

  if (options.pfp || options.status) {
    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.alignItems = "center";
    left.style.gap = "4px";

    if (options.status) {
      const dot = document.createElement("span");
      dot.className = `status-dot ${options.status}`;
      left.appendChild(dot);
    }

    if (options.pfp) {
      const img = document.createElement("img");
      img.src = options.pfp;
      img.className = "pfp small";
      left.appendChild(img);
    }

    const span = document.createElement("span");
    span.textContent = label;
    left.appendChild(span);

    div.appendChild(left);
  } else {
    div.textContent = label;
  }

  if (options.buttons) {
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

  if (options.onClick) {
    div.onclick = options.onClick;
  }

  return div;
}

export function updateUserStatus(username, status) {
  const el = document.querySelector(`[data-user="${username}"] .status-dot`);
  if (!el) return;
  el.className = `status-dot ${status}`;
}
