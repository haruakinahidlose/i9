import { state, setChatTitle, renderList, createListItem } from "./ui.js";
import { API_BASE, loadMessagesForDM } from "./chat.js";

export async function openDM(username) {
  const res = await fetch(`${API_BASE}/dms/open`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: state.token
    },
    body: JSON.stringify({ user: username })
  });
  const dm = await res.json();
  state.currentDM = dm.id;
  state.currentRoom = null;
  setChatTitle(`DM with ${username}`);
  await loadMessagesForDM(dm.id);
  await loadDMList();
}

export async function loadDMList() {
  // simple: DM list is derived from messages or we can just show last opened
  // For now, we just show "active DM" if any
  const list = [];
  if (state.currentDM) {
    list.push({ id: state.currentDM, label: "Current DM" });
  }
  renderList("dmList", list, item =>
    createListItem(item.label, {
      onClick: () => {
        // re-open DM
        if (state.currentDM) {
          loadMessagesForDM(state.currentDM);
        }
      }
    })
  );
}
