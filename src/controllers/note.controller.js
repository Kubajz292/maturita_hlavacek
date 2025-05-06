// src/controllers/note.controller.js
import Note from "../models/note.model.js";

export const createNote = async (req, res, next) => {
  try {
    console.log("✔️ CREATE note for user:", req.user);
    const note = await Note.create({ ...req.body, userId: req.user });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

export const listNotes = async (req, res, next) => {
  try {
    const filter = { userId: req.user };
    if (req.query.important === "true") filter.important = true;

    console.log("📥 LIST notes for user:", req.user, "filter:", filter);

    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    next(err);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    await Note.deleteOne({ _id: req.params.id, userId: req.user });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export const toggleImportant = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      [{ $set: { important: { $not: "$important" } } }],
      { new: true }
    );
    res.json(note);
  } catch (err) {
    next(err);
  }
};
