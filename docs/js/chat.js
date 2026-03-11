import { sendRoomMessage } from "./rooms.js";

export function setupChat(socket, currentRoomId, messageListEl, inputEl) {
  socket.onmessage = (msg) => {
    const data = JSON.parse(msg.data);

    if (data.type === "room_message" && data.room_id === currentRoomId) {
      const div = document.createElement("div");
      div.textContent = `${data.username}: ${data.content}`;
      messageListEl.appendChild(div);
    }
  };

  inputEl.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const content = inputEl.value.trim();
      if (!content) return;

      await sendRoomMessage(currentRoomId, content);
      inputEl.value = "";
    }
  });
}
