const API = "/api";
let token = localStorage.getItem("token") || null;
let username = localStorage.getItem("user") || null;

const qs = (sel) => document.querySelector(sel);
const page = location.pathname;

/* ========== LOGIN ========== */
if (page.includes("login")) {
  window.login = async function (e) {
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
      location.href = "app.html";
    } catch (err) {
      alert("❌ Přihlášení selhalo: " + (err.msg || "Neznámá chyba"));
    }
  };
}

/* ========== REGISTER ========== */
if (page.includes("register")) {
  window.register = async function (e) {
    e.preventDefault();
    const body = {
      username: qs("#regUser").value.trim(),
      password: qs("#regPass").value.trim(),
      aiConsent: qs("#regConsent").checked,
    };

    try {
      const res = await fetch(`${API}/auth/register`, fetchOpt(body));
      const data = await res.json();
      if (!res.ok) throw data;

      alert("✅ Registrace úspěšná. Můžeš se přihlásit.");
      location.href = "login.html";
    } catch (err) {
      alert("❌ Registrace selhala: " + (err.msg || "Neznámá chyba"));
    }
  };
}

/* ========== APP ========== */
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
    const password = prompt("Zadej heslo pro zrušení účtu:");
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
      alert("❌ Chyba při rušení účtu: " + (err.msg || "Neznámá chyba"));
    }
  };

  window.addNote = async (e) => {
    e.preventDefault();
    const body = {
      title: qs("#noteTitle").value.trim(),
      body: qs("#noteBody").value.trim(),
    };

    if (!body.title || !body.body) return alert("Vyplň nadpis i text.");

    try {
      const res = await fetchWithAuth(`${API}/notes`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw await res.json();
      e.target.reset();
      loadNotes();
    } catch (err) {
      alert("❌ Chyba při přidávání poznámky: " + (err.msg || "Neznámá chyba"));
    }
  };

  window.loadNotes = async () => {
    const importantOnly = qs("#showImportant")?.checked;
    try {
      const res = await fetchWithAuth(
        `${API}/notes${importantOnly ? "?important=true" : ""}`
      );
      const notes = await res.json();

      const box = qs("#notes");
      box.innerHTML = "";

      if (!notes || !notes.length) {
        box.innerHTML = "<p style='color:#888'>Žádné poznámky k zobrazení.</p>";
        return;
      }

      notes.forEach((n) => {
        const div = document.createElement("div");
        div.className = "note" + (n.important ? " important" : "");
        div.innerHTML = `
          <b>${n.title}</b>
          <small>${new Date(n.createdAt).toLocaleString()}</small>
          <p>${n.body}</p>
          <button onclick="toggleImportant('${n._id}')">
            ${n.important ? "Zrušit důležitost" : "Označit jako důležité"}
          </button>
          <button class="danger" onclick="delNote('${n._id}')">Smazat</button>
        `;
        box.appendChild(div);
      });
    } catch (err) {
      qs("#notes").innerHTML = "<p>❌ Nepodařilo se načíst poznámky.</p>";
    }
  };

  window.toggleImportant = async (id) => {
    await fetchWithAuth(`${API}/notes/${id}/important`, { method: "PATCH" });
    loadNotes();
  };

  window.delNote = async (id) => {
    if (!confirm("Opravdu smazat poznámku?")) return;
    await fetchWithAuth(`${API}/notes/${id}`, { method: "DELETE" });
    loadNotes();
  };
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
