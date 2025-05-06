const API = "https://maturita-hlavacek.onrender.com";

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
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", body.username);
      location.href = "app.html";
    } catch (err) {
      alert("❌ Přihlášení selhalo: " + (err.msg || "Chyba"));
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
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw data;

      alert("✅ Registrováno, můžeš se přihlásit.");
      location.href = "login.html";
    } catch (err) {
      alert("❌ Chyba registrace: " + (err.msg || "Neznámá chyba"));
    }
  };
}

/* ========== APP ========== */
if (page.includes("app")) {
  if (!token) location.href = "login.html";

  qs("#who").textContent = username;

  window.logout = () => {
    localStorage.clear();
    location.href = "login.html";
  };

  window.deleteAccount = async () => {
    const password = prompt("Zadej své heslo pro potvrzení:");
    if (!password) return;

    const res = await fetch(`${API}/user/account`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      alert("Účet zrušen.");
      logout();
    } else {
      const data = await res.json();
      alert("Chyba: " + (data.msg || "Nepodařilo se zrušit účet."));
    }
  };

  window.addNote = async (e) => {
    e.preventDefault();
    const title = qs("#noteTitle").value.trim();
    const body = qs("#noteBody").value.trim();
    if (!title || !body) return alert("Zadej název a text.");

    const res = await fetch(`${API}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, body }),
    });

    if (res.ok) {
      e.target.reset();
      loadNotes();
    } else {
      const data = await res.json();
      alert("❌ Chyba při přidání: " + (data.msg || "Chyba"));
    }
  };

  window.loadNotes = async () => {
    const importantOnly = qs("#showImportant")?.checked;
    const url = `${API}/notes${importantOnly ? "?important=true" : ""}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const notes = await res.json();
    const box = qs("#notes");
    box.innerHTML = "";

    if (!notes.length) {
      box.innerHTML = "<p style='color:#888'>Žádné poznámky.</p>";
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
  };

  window.toggleImportant = async (id) => {
    await fetch(`${API}/notes/${id}/important`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    loadNotes();
  };

  window.delNote = async (id) => {
    if (!confirm("Opravdu smazat?")) return;
    await fetch(`${API}/notes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    loadNotes();
  };

  loadNotes();
}

/* ========== Helpers ========== */
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
