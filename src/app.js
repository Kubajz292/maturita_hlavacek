import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import noteRoutes from "./routes/note.routes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 📦 obslouží složku public
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// 🌐 zobrazí frontend na "/"
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "../public/index.html"))
);

export default app;
