import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { UserController } from "./user.controller.js";

const router = Router();

router.get("/money", authMiddleware, UserController.getUserMoney);
router.post("/money/add", authMiddleware, UserController.addUserMoney);
router.post("/money/remove", authMiddleware, UserController.removeUserMoney);
router.get("/streak", authMiddleware, UserController.getUserStreak);

export const userRouter = router;
