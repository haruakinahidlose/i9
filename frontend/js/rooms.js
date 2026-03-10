import { state, renderList, createListItem, setChatTitle } from "./ui.js";
import { API_BASE, loadMessagesForRoom } from "./chat.js";

export async function loadRooms() {
  const res = await fetch(`${API_BASE}/rooms`, {
    headers: { Authorization: state.token }
  });
  const rooms = await res.json();
  state.rooms = rooms;
  renderRooms();
}

export function renderRooms() {
  renderList("roomList", state.rooms, room =>
    createListItem(`# ${room.name}`, {
      onClick: async () => {
        state.currentRoom = room.id;
        state.currentDM = null;
        setChatTitle(`# ${room.name}`);
        await loadMessagesForRoom(room.id);
      }
    })
  );
}

export function setupRoomActions() {
  const btn = document.getElementById("createRoomBtn");
  const input = document.getElementById("newRoomInput");
  if (!btn || !input) return;

  btn.onclick = async () => {
    const name = input.value.trim();
    if (!name) return;

    await fetch(`${API_BASE}/rooms/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: state.token
      },
      body: JSON.stringify({ name })
    });

    input.value = "";
    await loadRooms();
  };
}
