// src/server.js
//--------------------------------------------------------------
// 1) Načti .env explicitně z kořene projektu
//--------------------------------------------------------------
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// __dirname = absolutní cesta ke složce /src
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ../.env = o úroveň výš (kořen projektu)
dotenv.config({ path: path.join(__dirname, "../.env") });

//--------------------------------------------------------------
// 2) Ostatní importy a spuštění serveru
//--------------------------------------------------------------
import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT ?? 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() =>
    app.listen(PORT, () =>
      console.log(`⇢ Server listening on http://localhost:${PORT}`)
    )
  )
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
