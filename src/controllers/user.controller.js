// src/controllers/user.controller.js
import User from "../models/user.model.js";
import Note from "../models/note.model.js";

export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user);
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ msg: "Chybné heslo." });

    await Note.deleteMany({ userId: user._id });
    await user.deleteOne();
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
