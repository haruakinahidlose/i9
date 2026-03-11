// Restore username if saved
let username = localStorage.getItem("nebula-username");

const loginDiv = document.getElementById("login");
const appDiv = document.getElementById("app");
const welcome = document.getElementById("welcome");
const messages = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");

function enterChat() {
    username = document.getElementById("username").value.trim();
    if (!username) return;

    localStorage.setItem("nebula-username", username);
    startApp();
}

document.getElementById("loginBtn").onclick = enterChat;

function startApp() {
    loginDiv.style.display = "none";
    appDiv.style.display = "block";
    welcome.textContent = "Welcome, " + username;

    connectWS();
}

if (username) startApp();

// WebSocket
let ws;

function connectWS() {
    ws = new WebSocket("wss://echo.websocket.events");

    ws.onopen = () => {
        messages.value += "[system] Connected\n";
    };

    ws.onmessage = (event) => {
        messages.value += event.data + "\n";
    };

    ws.onclose = () => {
        messages.value += "[system] Disconnected\n";
    };
}

document.getElementById("sendBtn").onclick = () => {
    const text = msgInput.value.trim();
    if (!text) return;

    const msg = username + ": " + text;
    ws.send(msg);
    messages.value += msg + "\n";
    msgInput.value = "";
};
