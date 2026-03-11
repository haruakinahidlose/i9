let lastSender = null;
let lastTime = 0;

function addMessage(msg) {
  const box = document.getElementById("messages");

  const now = new Date(msg.created_at).getTime();
  const gap = now - lastTime > 60000;
  const newSender = msg.username !== lastSender;

  if (newSender || gap) {
    const cluster = document.createElement("div");
    cluster.className = "msg-cluster";

    const header = document.createElement("div");
    header.className = "msg-header";
    header.textContent = `${msg.username} — ${new Date(msg.created_at).toLocaleTimeString()}`;
    cluster.appendChild(header);

    const text = document.createElement("div");
    text.className = "msg-text";
    text.textContent = msg.content;
    cluster.appendChild(text);

    box.appendChild(cluster);
  } else {
    const text = document.createElement("div");
    text.className = "msg-text";
    text.textContent = msg.content;
    box.lastChild.appendChild(text);
  }

  lastSender = msg.username;
  lastTime = now;

  box.scrollTop = box.scrollHeight;
}
