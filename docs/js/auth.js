// CHANGE THIS to your backend URL
const API_BASE = "https://i9.up.railway.app/api";

/* ---------------- UI SWITCHING ---------------- */

document.getElementById("goSignup").onclick = () => {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("signupBox").style.display = "block";
};

document.getElementById("goLogin").onclick = () => {
    document.getElementById("signupBox").style.display = "none";
    document.getElementById("loginBox").style.display = "block";
};

/* ---------------- LOGIN ---------------- */

document.getElementById("loginBtn").onclick = async () => {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const errorEl = document.getElementById("loginError");

    errorEl.textContent = "";

    if (!username || !password) {
        errorEl.textContent = "Username and password required";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.error) {
            errorEl.textContent = data.error;
            return;
        }

        // Save token + user
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Go to chat app
        window.location.href = "app.html";
    } catch {
        errorEl.textContent = "Network error";
    }
};

/* ---------------- SIGNUP ---------------- */

document.getElementById("signupBtn").onclick = async () => {
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const pfp_url = document.getElementById("signupPfp").value.trim() || null;
    const errorEl = document.getElementById("signupError");

    errorEl.textContent = "";

    if (!username || !password) {
        errorEl.textContent = "Username and password required";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, pfp_url })
        });

        const data = await res.json();

        if (data.error) {
            errorEl.textContent = data.error;
            return;
        }

        // Save token + user
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Go to chat app
        window.location.href = "app.html";
    } catch {
        errorEl.textContent = "Network error";
    }
};
