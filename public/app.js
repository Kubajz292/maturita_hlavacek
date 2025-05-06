const API = "/api";
let token = localStorage.getItem("token") || null;
let username = localStorage.getItem("user") || null;

const qs = (sel) => document.querySelector(sel);

const page = location.pathname;

// === LOGIN ===
if (page.includes("login")) {
  window.login = async function (e) {
    e.preventDefault();
    const body = {
      username: qs("#logUser").value.trim(),
      password: qs("#logPass").value.trim(),
    };
    const res = await fetch(`${API}/auth/login`, fetchOpt(body));
    const data = await res.json();
    if (!res.ok) return alert("❌ Login error: " + (data.msg || "Chyba"));

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", body.username);
    location.href = "app.html";
  };
}

// === REGISTER ===
if (page.includes("register")) {
  window.register = async function (e) {
    e.preventDefault();
    const body = {
      username: qs("#regUser").value.trim(),
      password: qs("#regPass").value.trim(),
      aiConsent: qs("#regConsent").checked,
    };
    const res = await fetch(`${API}/auth/register`, fetchOpt(body));
    const data = await res.json();
    if (!res.ok) return alert("❌ Registrace selhala: " + (data.msg || "Chyba"));
    alert("✅ Registrováno, můžeš se přihlásit.");
    location.href = "login.html";
  };
}

// === APP ===
if (page.includes("app")) {
  if (!token) location.href = "login.html";
  else {
    qs("#who").textContent = username;
    loadNotes();
  }

  window.logout = () => {
    localStorage.clear();
    location.href = "login.html";
  };

  window.deleteAccount = async () => {
    const password = prompt("Potvrď heslo:");
    if (!password) return;
    const res = await fetchWithAuth(`${API}/user/account`, {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      alert("Účet zrušen.");
      logout();
    } else {
      const data = await res.json();
      alert("❌ " + (data.msg || "Chyba při mazání účtu"));
    }
  };

  window.addNote = async (e) => {
    e.preventDefault();
    const body = {
      title: qs("#noteTitle").value,
      body: qs("#noteBody").value,
    };
    const res = await fetchWithAuth(`${API}/notes`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (res.ok) {
      e.target.reset();
      loadNotes();
    }
  };

  window.loadNotes = async () => {
    qs("#notes").hidden = true;
    qs("#loader").hidden = false;
    const importantOnly = qs("#showImportant").checked;
    const res = await fetchWithAuth(
      `${API}/notes${importantOnly ? "?important=true" : ""}`
    );
    const notes = await res.json();
    renderNotes(notes);
    qs("#notes").hidden = false;
    qs("#loader").hidden = true;
  };

  window.toggleImportant = async (id) => {
    await fetchWithAuth(`${API}/notes/${id}/important`, { method: "PATCH" });
    loadNotes();
  };

  window.delNote = async (id) => {
    if (confirm("Smazat poznámku?")) {
      await fetchWithAuth(`${API}/notes/${id}`, { method: "DELETE" });
      loadNotes();
    }
  };

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
}

// === HELPERS ===
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
