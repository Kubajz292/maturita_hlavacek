const API = "/api";
let token = localStorage.getItem("token") || null;
let username = localStorage.getItem("user") || null;

const qs = (sel) => document.querySelector(sel);

function showLogin() {
  qs("#login").hidden = false;
  qs("#register").hidden = true;
}
function showRegister() {
  qs("#login").hidden = true;
  qs("#register").hidden = false;
}
showLogin(); // default

/* ---------- AUTH ---------- */
async function register(e) {
  e.preventDefault();
  const body = {
    username: qs("#regUser").value,
    password: qs("#regPass").value,
    aiConsent: qs("#regConsent").checked,
  };
  await fetch(`${API}/auth/register`, fetchOpt(body));
  alert("Registrováno, můžeš se přihlásit.");
  showLogin();
}

async function login(e) {
  e.preventDefault();
  const body = {
    username: qs("#logUser").value,
    password: qs("#logPass").value,
  };
  const res = await fetch(`${API}/auth/login`, fetchOpt(body));
  const data = await res.json();
  token = data.token;
  username = body.username;
  localStorage.setItem("token", token);
  localStorage.setItem("user", username);
  qs("#who").textContent = username;
  qs("#login").hidden = true;
  qs("#authToggle").hidden = true;
  qs("#app").hidden = false;
  loadNotes();
}

function logout() {
  localStorage.clear();
  location.reload();
}

async function deleteAccount() {
  if (!confirm("Opravdu zrušit účet?")) return;
  const password = prompt("Potvrď své heslo:");
  await fetchWithAuth(`${API}/user/account`, {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
  alert("Účet zrušen.");
  logout();
}

/* ---------- NOTES CRUD ---------- */
async function loadNotes() {
  const importantOnly = qs("#showImportant").checked;
  const res = await fetchWithAuth(
    `${API}/notes${importantOnly ? "?important=true" : ""}`
  );
  const notes = await res.json();
  const box = qs("#notes");
  box.innerHTML = "";
  notes.forEach((n) => {
    const div = document.createElement("div");
    div.className = "note" + (n.important ? " important" : "");
    div.innerHTML = `
      <b>${n.title}</b> <small>${new Date(n.createdAt).toLocaleString()}</small>
      <p>${n.body}</p>
      <button onclick="toggleImportant('${n._id}')">${
      n.important ? "⚪" : "⭐"
    }</button>
      <button onclick="delNote('${n._id}')">🗑️</button>
    `;
    box.appendChild(div);
  });
}

async function addNote(e) {
  e.preventDefault();
  const body = {
    title: qs("#noteTitle").value,
    body: qs("#noteBody").value,
  };
  await fetchWithAuth(`${API}/notes`, { method: "POST", body: JSON.stringify(body) });
  e.target.reset();
  loadNotes();
}

async function delNote(id) {
  await fetchWithAuth(`${API}/notes/${id}`, { method: "DELETE" });
  loadNotes();
}

async function toggleImportant(id) {
  await fetchWithAuth(`${API}/notes/${id}/important`, { method: "PATCH" });
  loadNotes();
}

/* ---------- helpers ---------- */
function fetchOpt(body) {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function fetchWithAuth(url, opts = {}) {
  return fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
}

/* auto‑login pokud je token v localStorage */
if (token) {
  qs("#who").textContent = username;
  qs("#authToggle").hidden = true;
  qs("#login").hidden = true;
  qs("#app").hidden = false;
  loadNotes();
}
