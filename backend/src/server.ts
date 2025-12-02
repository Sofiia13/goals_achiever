import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Завантажуємо .env
const envPath = path.resolve(__dirname, "../.env");
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

// ВАЖЛИВО: Перевірка змінних ОДРАЗУ після завантаження
console.log("=== Environment Variables Check ===");
console.log(
  "GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY
    ? `Present (${process.env.GEMINI_API_KEY.substring(0, 10)}...)`
    : "MISSING"
);
console.log("PORT:", process.env.PORT || "3001");
console.log("===================================");

import app from "./app.js";

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Test endpoint: http://localhost:${PORT}/api/ai/plan`);
});

// Логування помилок сервера
server.on("error", (error) => {
  console.error("Server error:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});
