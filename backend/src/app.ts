import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRouter from "./modules/ai/ai.controller.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

app.use("/api/ai", aiRouter);

app.use((req, res) => {
  console.log("404 - Route not found:", req.path);
  res.status(404).json({ error: "Route not found" });
});

export default app;
