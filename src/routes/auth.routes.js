// src/routes/auth.routes.js
import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";

const r = Router();

// POST /api/auth/register  – registrace nového uživatele
r.post("/register", register);

// POST /api/auth/login  – přihlášení, vrací JWT token
r.post("/login", login);

export default r;
