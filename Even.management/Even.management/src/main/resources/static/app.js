// ================= API CONFIG =================
// Adjust if your backend runs elsewhere.
const API = "http://localhost:8081";

// ================= HELPERS =================
function toast(message, type = "success") {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.className = "toast show " + type;
  setTimeout(() => (el.className = "toast"), 3000);
}

function token() {
  return localStorage.getItem("token");
}

function showTab(which) {
  const isLogin = which === "login";
  document.getElementById("tabLogin").classList.toggle("active", isLogin);
  document.getElementById("tabRegister").classList.toggle("active", !isLogin);
  document.getElementById("loginForm").style.display = isLogin ? "block" : "none";
  document.getElementById("registerForm").style.display = isLogin ? "none" : "block";
}

// ================= AUTH =================
async function handleRegister(e) {
  e.preventDefault();

  const body = {
    username: document.getElementById("regUsername").value.trim(),
    email: document.getElementById("regEmail").value.trim(),
    password: document.getElementById("regPassword").value,
    confirmPassword: document.getElementById("regConfirm").value,
  };

  try {
    const res = await fetch(`${API}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text || "Registration failed");

    // Backend returns { message: "..." } or a plain string
    let data;
    try { data = JSON.parse(text); } catch { data = { message: text }; }
    toast(data.message || "Registered successfully", "success");

    showTab("login");
    document.getElementById("loginUsername").value = body.username;
  } catch (err) {
    toast(err.message, "error");
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const body = {
    username,
    password: document.getElementById("loginPassword").value,
  };

  try {
    const res = await fetch(`${API}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text || "Login failed");

    const data = JSON.parse(text);
    if (!data.token) throw new Error("No token returned");

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", username);
    toast("Logged in", "success");
    enterDashboard();
  } catch (err) {
    toast(err.message, "error");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  document.getElementById("dashScreen").style.display = "none";
  document.getElementById("authScreen").style.display = "flex";
  toast("Logged out", "success");
}

function enterDashboard() {
  document.getElementById("authScreen").style.display = "none";
  document.getElementById("dashScreen").style.display = "block";
  document.getElementById("currentUser").textContent =
    "Hi, " + (localStorage.getItem("username") || "user");
  document.getElementById("tokenView").value = token() || "";
}

// ================= EVENTS =================
async function handleEventRegister(e) {
  e.preventDefault();

  const name = document.getElementById("eventRegName").value.trim();
  const id = document.getElementById("eventRegId").value;

  try {
    const res = await fetch(
      `${API}/user/event/register?name=${encodeURIComponent(name)}&id=${encodeURIComponent(id)}`,
      {
        method: "POST",
        headers: { Authorization: "Bearer " + token() },
      }
    );

    if (res.status === 401 || res.status === 403) {
      toast("Session expired. Please login again.", "error");
      logout();
      return;
    }

    const text = await res.text();
    if (!res.ok) throw new Error(text || "Could not register for event");

    toast("Registered for event successfully", "success");
    document.getElementById("eventRegName").value = "";
    document.getElementById("eventRegId").value = "";
  } catch (err) {
    toast(err.message, "error");
  }
}

// ================= INIT =================
if (token()) {
  enterDashboard();
} else {
  document.getElementById("authScreen").style.display = "flex";
}
