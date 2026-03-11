import { connectWS } from "./ws.js";
import { loadRooms } from "./rooms.js";
import { loadFriends } from "./friends.js";
import { loadDMs } from "./dms.js";

const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html";

const socket = connectWS(handleWS);

async function init() {
  const rooms = await loadRooms();
  const friends = await loadFriends();
  const dms = await loadDMs();

  console.log("Rooms:", rooms);
  console.log("Friends:", friends);
  console.log("DMs:", dms);
}

function handleWS(data) {
  console.log("WS:", data);
}

init();
