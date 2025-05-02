// src/routes/note.routes.js
import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import {
  createNote,
  listNotes,
  deleteNote,
  toggleImportant,
} from "../controllers/note.controller.js";

const r = Router();
r.use(auth);

r.post("/", createNote);
r.get("/", listNotes);
r.delete("/:id", deleteNote);
r.patch("/:id/important", toggleImportant);

export default r;
