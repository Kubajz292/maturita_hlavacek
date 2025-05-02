// src/app.js
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import noteRoutes from "./routes/note.routes.js";

const app = express();
app.use(express.json());

// mount routers
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// jednoduchý health‑check
app.get("/", (_req, res) => res.send("🟢 Notes API running"));

export default app;

