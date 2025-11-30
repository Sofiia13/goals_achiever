import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Ініціалізація змінних оточення
dotenv.config();

// Створюємо Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Простий тестовий роут
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// Можна додавати інші роутери
// import userRouter from "./routes/user";
// app.use("/users", userRouter);

export default app;
