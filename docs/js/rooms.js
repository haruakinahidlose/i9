import { state, renderList, createListItem, setChatTitle } from "/i9/js/ui.js";
import { loadMessagesForRoom } from "/i9/js/chat.js";
import { sendWSMessage } from "/i9/js/ws.js";

export const API_BASE = "https://i9.up.railway.app/api/";

export async function loadRooms() {
  const res = await fetch(`${API_BASE}rooms`, {
    headers: { Authorization: state.token }
  });
  state.rooms = await res.json();
  renderRooms();
}

export function setupRoomActions() {
  const btn = document.getElementById("createRoomBtn");
  const input = document.getElementById("newRoomInput");

  if (!btn || !input) return;

  btn.onclick = async () => {
    const name = input.value.trim();
    if (!name) return;

    await fetch(`${API_BASE}rooms/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: state.token
      },
      body: JSON.stringify({ name })
    });

    input.value = "";
    loadRooms();
  };
}

function renderRooms() {
  renderList("roomList", state.rooms, room =>
    createListItem(room.name, {
      onClick: () => {
        state.currentRoom = room.id;
        state.currentDM = null;
        setChatTitle(room.name);
        loadMessagesForRoom(room.id);
      }
    })
  );
}
