import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { aiRouter } from "./modules/ai/ai.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { goalRouter } from "./modules/goal/goal.routes.js";
import { taskRouter } from "./modules/task/task.routes.js";
import { userRouter } from "./modules/user/user.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

const normalizeOrigin = (url: string) => url.replace(/\/+$/, "");
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS?.split(",") ?? []),
  "http://localhost:5173",
]
  .filter(Boolean)
  .map((origin) => normalizeOrigin(origin!.trim()));

const defaultAllowedOriginPatterns: RegExp[] = [
  /^https:\/\/.*\.vercel\.app$/,
];

const envAllowedOriginPatterns = (process.env.FRONTEND_URL_PATTERNS?.split(",") ?? [])
  .map((pattern) => pattern.trim())
  .filter(Boolean)
  .map((pattern) => new RegExp(pattern));

const allowedOriginPatterns = [
  ...defaultAllowedOriginPatterns,
  ...envAllowedOriginPatterns,
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const requestOrigin = normalizeOrigin(origin);
    const isAllowedByList = allowedOrigins.includes(requestOrigin);
    const isAllowedByPattern = allowedOriginPatterns.some((pattern) =>
      pattern.test(requestOrigin)
    );

    if (isAllowedByList || isAllowedByPattern) {
      return callback(null, true);
    }

    console.log(`CORS blocked for origin: ${origin}`);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

app.use("/api/ai", aiRouter);
app.use("/auth", authRouter);
app.use("/goals", goalRouter);
app.use("/tasks", taskRouter);
app.use("/user", userRouter);

app.use((req, res) => {
  console.log("404 - Route not found:", req.path);
  res.status(404).json({ error: "Route not found" });
});

export default app;
