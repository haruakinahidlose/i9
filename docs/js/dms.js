import { state, renderList, createListItem, setChatTitle } from "/i9/js/ui.js";
import { loadMessagesForDM } from "/i9/js/chat.js";

export const API_BASE = "https://i9.up.railway.app/api/";

export async function loadDMList() {
  const res = await fetch(`${API_BASE}dms`, {
    headers: { Authorization: state.token }
  });
  state.dms = await res.json();
  renderDMs();
}

function renderDMs() {
  renderList("dmList", state.dms, dm =>
    createListItem(dm.username, {
      username: dm.username,
      pfp: dm.pfp,
      status: dm.status,
      onClick: () => {
        state.currentDM = dm.username;
        state.currentRoom = null;
        setChatTitle(dm.username);
        loadMessagesForDM(dm.username);
      }
    })
  );
}
