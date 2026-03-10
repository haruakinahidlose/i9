// CHANGE THIS to your backend URL
const API_BASE = "https://your-railway-backend-url.up.railway.app/api";

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

if (loginTab && signupTab) {
  loginTab.onclick = () => {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
  };

  signupTab.onclick = () => {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  };
}

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

if (loginBtn) {
  loginBtn.onclick = async () => {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const errorEl = document.getElementById("loginError");

    errorEl.textContent = "";

    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.error) {
      errorEl.textContent = data.error;
    } else {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      window.location.href = "app.html";
    }
  };
}

if (signupBtn) {
  signupBtn.onclick = async () => {
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const errorEl = document.getElementById("signupError");

    errorEl.textContent = "";

    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.error) {
      errorEl.textContent = data.error;
    } else {
      // auto-login
      const loginRes = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const loginData = await loginRes.json();
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("username", username);
      window.location.href = "app.html";
    }
  };
}
