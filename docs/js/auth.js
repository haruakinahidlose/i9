// CHANGE THIS to your backend URL
const API_BASE = "https://i9.up.railway.app/api";

// UI elements
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

const loginUsername = document.getElementById("loginUsername");
const signupUsername = document.getElementById("signupUsername");
const signupPfp = document.getElementById("signupPfp");

const loginError = document.getElementById("loginError");
const signupError = document.getElementById("signupError");

// ---------------- LOGIN ----------------
if (loginBtn) {
    loginBtn.onclick = async () => {
        loginError.textContent = "";

        const username = loginUsername.value.trim();
        if (!username) {
            loginError.textContent = "Username required";
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username })
            });

            const data = await res.json();

            if (data.error) {
                loginError.textContent = data.error;
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            window.location.href = "app.html";
        } catch (err) {
            loginError.textContent = "Network error";
        }
    };
}

// ---------------- SIGNUP ----------------
if (signupBtn) {
    signupBtn.onclick = async () => {
        signupError.textContent = "";

        const username = signupUsername.value.trim();
        const pfp_url = signupPfp.value.trim() || null;

        if (!username) {
            signupError.textContent = "Username required";
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, pfp_url })
            });

            const data = await res.json();

            if (data.error) {
                signupError.textContent = data.error;
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            window.location.href = "app.html";
        } catch (err) {
            signupError.textContent = "Network error";
        }
    };
}
