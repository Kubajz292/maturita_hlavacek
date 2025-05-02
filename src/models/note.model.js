// src/models/note.model.js
import { Schema, model, Types } from "mongoose";

const NoteSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    important: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("Note", NoteSchema);
