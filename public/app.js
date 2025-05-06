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

showLogin();

/* ========== AUTH ========== */
async function register(e) {
  e.preventDefault();
  const body = {
    username: qs("#regUser").value.trim(),
    password: qs("#regPass").value.trim(),
    aiConsent: qs("#regConsent").checked,
  };

  if (!body.username || !body.password || !body.aiConsent) {
    return alert("Vyplň všechna pole a potvrď souhlas.");
  }

  try {
    const res = await fetch(`${API}/auth/register`, fetchOpt(body));
    if (!res.ok) throw await res.json();
    alert("✅ Registrováno, můžeš se přihlásit.");
    showLogin();
  } catch (err) {
    alert("❌ Chyba při registraci: " + (err.msg || "Neznámá chyba"));
  }
}

async function login(e) {
  e.preventDefault();
  const body = {
    username: qs("#logUser").value.trim(),
    password: qs("#logPass").value.trim(),
  };

  try {
    const res = await fetch(`${API}/auth/login`, fetchOpt(body));
    const data = await res.json();
    if (!res.ok) throw data;

    token = data.token;
    username = body.username;
    localStorage.setItem("token", token);
    localStorage.setItem("user", username);
    qs("#who").textContent = username;
    qs("#login").hidden = true;
    qs("#authToggle").hidden = true;
    qs("#app").hidden = false;
    loadNotes();
  } catch (err) {
    alert("❌ Přihlášení selhalo: " + (err.msg || "Neznámá chyba"));
  }
}

function logout() {
  localStorage.clear();
  location.reload();
}

async function deleteAccount() {
  if (!confirm("Opravdu zrušit účet?")) return;
  const password = prompt("Zadej heslo pro potvrzení:");
  if (!password) return;

  try {
    const res = await fetchWithAuth(`${API}/user/account`, {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw await res.json();
    alert("✅ Účet zrušen.");
    logout();
  } catch (err) {
    alert("❌ Nepodařilo se zrušit účet: " + (err.msg || "Neznámá chyba"));
  }
}

/* ========== NOTES ========== */
async function loadNotes() {
  const importantOnly = qs("#showImportant").checked;
  qs("#notes").innerHTML = "<p>🔄 Načítání...</p>";

  try {
    const res = await fetchWithAuth(
      `${API}/notes${importantOnly ? "?important=true" : ""}`
    );
    const notes = await res.json();
    renderNotes(notes);
  } catch {
    qs("#notes").innerHTML = "<p>❌ Nepodařilo se načíst poznámky.</p>";
  }
}

function renderNotes(notes) {
  const box = qs("#notes");
  box.innerHTML = "";
  if (!notes.length) {
    box.innerHTML = "<p>📭 Žádné poznámky</p>";
    return;
  }

  notes.forEach((n) => {
    const div = document.createElement("div");
    div.className = "note" + (n.important ? " important" : "");
    div.innerHTML = `
      <b>${n.title}</b>
      <small>${new Date(n.createdAt).toLocaleString()}</small>
      <p>${n.body}</p>
      <button onclick="toggleImportant('${n._id}')">${
      n.important ? "⭐" : "⚪"
    }</button>
      <button class="danger" onclick="delNote('${n._id}')">🗑️</button>
    `;
    box.appendChild(div);
  });
}

async function addNote(e) {
  e.preventDefault();
  const body = {
    title: qs("#noteTitle").value.trim(),
    body: qs("#noteBody").value.trim(),
  };
  if (!body.title || !body.body) return alert("Zadej nadpis i text.");

  try {
    const res = await fetchWithAuth(`${API}/notes`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await res.json();
    e.target.reset();
    loadNotes();
  } catch (err) {
    alert("❌ Chyba při přidávání: " + (err.msg || "Neznámá chyba"));
  }
}

async function delNote(id) {
  if (!confirm("Smazat poznámku?")) return;
  await fetchWithAuth(`${API}/notes/${id}`, { method: "DELETE" });
  loadNotes();
}

async function toggleImportant(id) {
  await fetchWithAuth(`${API}/notes/${id}/important`, { method: "PATCH" });
  loadNotes();
}

/* ========== HELPERS ========== */
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

/* ========== AUTO‑LOGIN ========== */
if (token) {
  qs("#who").textContent = username;
  qs("#authToggle").hidden = true;
  qs("#login").hidden = true;
  qs("#app").hidden = false;
  loadNotes();
}
