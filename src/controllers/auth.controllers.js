// src/controllers/auth.controller.js
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const { username, password, aiConsent } = req.body;
    if (!aiConsent)
      return res.status(400).json({ msg: "Musíš potvrdit souhlas s AI." });

    if (await User.findOne({ username }))
      return res.status(409).json({ msg: "Uživatel již existuje." });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, passwordHash, aiConsent });
    res.status(201).json({ id: user._id });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ msg: "Nesprávné přihlašovací údaje." });

    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });
    res.json({ token });
  } catch (err) {
    next(err);
  }
};
